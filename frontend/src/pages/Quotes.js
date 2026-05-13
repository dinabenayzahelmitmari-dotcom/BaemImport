
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ESTADO_BADGE = { borrador:'badge-grey', enviado:'badge-info', aceptado:'badge-success', rechazado:'badge-danger', expirado:'badge-warning' };
const ESTADO_LABEL = { borrador:'Borrador', enviado:'Enviado', aceptado:'Aceptado', rechazado:'Rechazado', expirado:'Expirado' };

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState('');
  const [msg, setMsg]         = useState({ text:'', ok:false });
  const [loadingPdf, setLoadingPdf] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(null);

  const load = () => {
    setLoading(true);
    const params = filtro ? `?estado=${filtro}` : '';
    axios.get(`/api/quotes${params}`)
      .then(r => setQuotes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filtro]);

  const showMsg = (text, ok) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text:'', ok:false }), 3000); };

  const descargarPdf = async (q, e) => {
    e.stopPropagation();
    setLoadingPdf(q._id);
    try {
      const res = await axios.get(`/api/quotes/${q._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `${q.numero}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { showMsg('Error al generar el PDF', false); }
    finally { setLoadingPdf(null); }
  };

  const enviarEmail = async (q, e) => {
    e.stopPropagation();
    if (!q.cliente?.email) return showMsg('El cliente no tiene email registrado', false);
    setLoadingEmail(q._id);
    try {
      await axios.post(`/api/quotes/${q._id}/enviar`);
      showMsg('Presupuesto enviado por email correctamente', true);
      load();
    } catch (err) { showMsg(err.response?.data?.error || 'Error al enviar', false); }
    finally { setLoadingEmail(null); }
  };

  const cambiarEstado = async (q, estado, e) => {
    e.stopPropagation();
    await axios.put(`/api/quotes/${q._id}`, { estado });
    load();
  };

  return (
    <div className="page">
      {msg.text && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background: msg.ok ? '#e8f5e9' : '#fff0f2', borderColor: msg.ok ? '#c8e6c9' : '#ffd0d7', color: msg.ok ? '#2e7d32' : 'var(--red-dark)', fontSize:13 }}>
          {msg.text}
        </div>
      )}

      <div className="page-header fade-in">
        <div><h1 className="page-title">Presupuestos</h1><p className="page-subtitle">{quotes.length} en total</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/quotes/new')}>+ Nuevo</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }} className="fade-in fade-in-1">
        {[['','Todos'],['borrador','Borrador'],['enviado','Enviado'],['aceptado','Aceptado'],['rechazado','Rechazado']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filtro === v ? 'btn-navy' : 'btn-outline'}`} style={{ fontSize:12 }}
            onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : quotes.length === 0 ? (
        <div className="empty-state">
          <h3>Sin presupuestos</h3>
          <p>Crea el primer presupuesto para un cliente</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/quotes/new')}>Nuevo presupuesto</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {quotes.map((q, i) => (
            <div key={q._id} className={`card card-pressable fade-in fade-in-${Math.min(i+1,4)}`}
              style={{ padding:'14px 16px' }} onClick={() => navigate(`/quotes/${q._id}/edit`)}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span className={`badge ${ESTADO_BADGE[q.estado]}`}>{ESTADO_LABEL[q.estado]}</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'var(--grey-500)' }}>{q.numero}</span>
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>
                    {q.cliente?.nombre} {q.cliente?.apellidos || ''}
                  </p>
                  <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>
                    {q.vehiculo ? `${q.vehiculo.marca} ${q.vehiculo.modelo}` : q.descripcionVehiculo || 'Sin vehiculo asignado'}
                  </p>
                  <p style={{ fontSize:11, color:'var(--grey-500)', marginTop:4 }}>
                    Creado: {new Date(q.createdAt).toLocaleDateString('es-ES')} · Validez: {q.validezDias} dias
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:800, color:'var(--navy)' }}>
                    {q.precioFinal?.toLocaleString('es-ES')} EUR
                  </p>
                </div>
              </div>

              <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
                <button className="btn btn-outline btn-sm" style={{ fontSize:11 }}
                  onClick={(e) => descargarPdf(q, e)} disabled={loadingPdf === q._id}>
                  {loadingPdf === q._id ? 'Generando...' : 'Descargar PDF'}
                </button>
                {q.cliente?.email && (
                  <button className="btn btn-outline btn-sm" style={{ fontSize:11 }}
                    onClick={(e) => enviarEmail(q, e)} disabled={loadingEmail === q._id}>
                    {loadingEmail === q._id ? 'Enviando...' : 'Enviar email'}
                  </button>
                )}
                {q.estado === 'enviado' && (
                  <>
                    <button className="btn btn-sm" style={{ fontSize:11, background:'#e8f5e9', color:'#2e7d32', border:'1px solid #c8e6c9' }}
                      onClick={(e) => cambiarEstado(q, 'aceptado', e)}>Marcar aceptado</button>
                    <button className="btn btn-sm" style={{ fontSize:11, background:'#fff0f2', color:'var(--red)', border:'1px solid #ffd0d7' }}
                      onClick={(e) => cambiarEstado(q, 'rechazado', e)}>Marcar rechazado</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
