
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ESTADO_BADGE = { emitida:'badge-info', pagada:'badge-success', parcialmente_pagada:'badge-warning', vencida:'badge-danger', cancelada:'badge-grey' };
const ESTADO_LABEL = { emitida:'Emitida', pagada:'Pagada', parcialmente_pagada:'Pago parcial', vencida:'Vencida', cancelada:'Cancelada' };

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState('');
  const [msg, setMsg]           = useState({ text:'', ok:false });
  const [loadingPdf, setLoadingPdf]     = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(null);

  const load = () => {
    setLoading(true);
    const params = filtro ? `?estado=${filtro}` : '';
    axios.get(`/api/invoices${params}`)
      .then(r => setInvoices(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filtro]);

  const showMsg = (text, ok) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text:'', ok:false }), 3000); };

  const descargarPdf = async (inv, e) => {
    e.stopPropagation();
    setLoadingPdf(inv._id);
    try {
      const res = await axios.get(`/api/invoices/${inv._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `${inv.numero}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { showMsg('Error al generar el PDF', false); }
    finally { setLoadingPdf(null); }
  };

  const enviarEmail = async (inv, e) => {
    e.stopPropagation();
    if (!inv.cliente?.email) return showMsg('El cliente no tiene email registrado', false);
    setLoadingEmail(inv._id);
    try {
      await axios.post(`/api/invoices/${inv._id}/enviar`);
      showMsg('Factura enviada por email correctamente', true);
    } catch (err) { showMsg(err.response?.data?.error || 'Error al enviar', false); }
    finally { setLoadingEmail(null); }
  };

  const marcarPagada = async (inv, e) => {
    e.stopPropagation();
    await axios.put(`/api/invoices/${inv._id}`, { estado: 'pagada' });
    load();
  };

  const totalFacturado = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPendiente = invoices.filter(i => ['emitida','parcialmente_pagada','vencida'].includes(i.estado)).reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div className="page">
      {msg.text && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background: msg.ok ? '#e8f5e9' : '#fff0f2', borderColor: msg.ok ? '#c8e6c9' : '#ffd0d7', color: msg.ok ? '#2e7d32' : 'var(--red-dark)', fontSize:13 }}>
          {msg.text}
        </div>
      )}

      <div className="page-header fade-in">
        <div><h1 className="page-title">Facturas</h1><p className="page-subtitle">{invoices.length} en total</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/invoices/new')}>+ Nueva</button>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }} className="fade-in fade-in-1">
        <div className="card" style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Total facturado</p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--navy)', marginTop:4 }}>{totalFacturado.toLocaleString('es-ES', { maximumFractionDigits:0 })} EUR</p>
        </div>
        <div className="card" style={{ padding:'14px 16px' }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Pendiente de cobro</p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color: totalPendiente > 0 ? 'var(--red)' : '#2e7d32', marginTop:4 }}>{totalPendiente.toLocaleString('es-ES', { maximumFractionDigits:0 })} EUR</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }} className="fade-in fade-in-1">
        {[['','Todas'],['emitida','Emitidas'],['pagada','Pagadas'],['vencida','Vencidas']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filtro === v ? 'btn-navy' : 'btn-outline'}`} style={{ fontSize:12 }}
            onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <h3>Sin facturas</h3>
          <p>No se encontraron facturas</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/invoices/new')}>Nueva factura</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {invoices.map((inv, i) => (
            <div key={inv._id} className={`card card-pressable fade-in fade-in-${Math.min(i+1,4)}`}
              style={{ padding:'14px 16px' }} onClick={() => navigate(`/invoices/${inv._id}/edit`)}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span className={`badge ${ESTADO_BADGE[inv.estado]}`}>{ESTADO_LABEL[inv.estado]}</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'var(--grey-500)' }}>{inv.numero}</span>
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>
                    {inv.cliente?.nombre} {inv.cliente?.apellidos || ''}
                  </p>
                  <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>
                    {new Date(inv.createdAt).toLocaleDateString('es-ES')} · {inv.metodoPago}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:800, color:'var(--navy)' }}>
                    {inv.total?.toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR
                  </p>
                  <p style={{ fontSize:11, color:'var(--grey-500)' }}>IVA incl.</p>
                </div>
              </div>

              <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
                <button className="btn btn-outline btn-sm" style={{ fontSize:11 }}
                  onClick={(e) => descargarPdf(inv, e)} disabled={loadingPdf === inv._id}>
                  {loadingPdf === inv._id ? 'Generando...' : 'Descargar PDF'}
                </button>
                {inv.cliente?.email && (
                  <button className="btn btn-outline btn-sm" style={{ fontSize:11 }}
                    onClick={(e) => enviarEmail(inv, e)} disabled={loadingEmail === inv._id}>
                    {loadingEmail === inv._id ? 'Enviando...' : 'Enviar al cliente'}
                  </button>
                )}
                {['emitida','parcialmente_pagada'].includes(inv.estado) && (
                  <button className="btn btn-sm" style={{ fontSize:11, background:'#e8f5e9', color:'#2e7d32', border:'1px solid #c8e6c9' }}
                    onClick={(e) => marcarPagada(inv, e)}>
                    Marcar como pagada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
