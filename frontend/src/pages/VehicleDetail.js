import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DetailPage.css';

const ESTADO_BADGE = { disponible:'badge-success', reservado:'badge-warning', vendido:'badge-danger', en_transito:'badge-info' };
const ESTADO_LABEL = { disponible:'Disponible', reservado:'Reservado', vendido:'Vendido', en_transito:'En tránsito' };

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [gastos, setGastos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('info');
  const [gastoForm, setGastoForm] = useState({ concepto:'Precio compra', importe:'', descripcion:'', pagado:false });
  const [savingGasto, setSavingGasto] = useState(false);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [msg, setMsg]                 = useState('');

  const load = async () => {
    try {
      const [v, g] = await Promise.all([
        axios.get(`/api/vehicles/${id}`),
        axios.get(`/api/expenses/vehicle/${id}`),
      ]);
      setVehicle(v.data);
      setGastos(g.data.gastos || []);
    } catch { navigate('/vehicles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    await axios.delete(`/api/vehicles/${id}`);
    navigate('/vehicles');
  };

  const handleEstado = async (estado) => {
    await axios.put(`/api/vehicles/${id}`, { estado });
    setVehicle(v => ({ ...v, estado }));
  };

  const handleGasto = async (e) => {
    e.preventDefault();
    setSavingGasto(true);
    try {
      await axios.post('/api/expenses', { ...gastoForm, vehiculo: id, importe: parseFloat(gastoForm.importe) });
      setGastoForm({ concepto:'Precio compra', importe:'', descripcion:'', pagado:false });
      load();
    } catch (err) { setMsg(err.response?.data?.error || 'Error'); }
    finally { setSavingGasto(false); }
  };

  const togglePagado = async (g) => {
    await axios.put(`/api/expenses/${g._id}`, { pagado: !g.pagado });
    load();
  };

  const deleteGasto = async (gid) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await axios.delete(`/api/expenses/${gid}`);
    load();
  };

  const descargarFicha = async () => {
    setPdfLoading(true);
    try {
      const res = await axios.get(`/api/vehicles/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `ficha-${vehicle.marca}-${vehicle.modelo}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { setMsg('Error al generar el PDF'); }
    finally { setPdfLoading(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;
  if (!vehicle) return null;

  const totalGastos = gastos.reduce((s, g) => s + g.importe, 0);
  const margenReal  = vehicle.precio ? vehicle.precio - totalGastos : null;

  return (
    <div className="page">
      {msg && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background:'#fff0f2', borderColor:'#ffd0d7', color:'var(--red-dark)', fontSize:13 }}>
          {msg}
          <button style={{ marginLeft:8, background:'none', border:'none', cursor:'pointer', color:'inherit', fontWeight:700 }} onClick={() => setMsg('')}>x</button>
        </div>
      )}

      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vehicles')}>
          <BackIcon /> Vehículos
        </button>
        <div className="detail-header-actions">
          <button className="btn btn-outline btn-sm" onClick={descargarFicha} disabled={pdfLoading}>
            <PdfIcon /> {pdfLoading ? 'Generando...' : 'Descargar ficha'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/vehicles/${id}/edit`)}>
            <EditIcon /> Editar
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="card fade-in fade-in-1" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div>
            <span className={`badge ${ESTADO_BADGE[vehicle.estado]}`}>{ESTADO_LABEL[vehicle.estado]}</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--navy)', margin:'8px 0 4px' }}>
              {vehicle.marca} {vehicle.modelo}
            </h1>
            <p style={{ color:'var(--grey-500)', fontSize:14 }}>{vehicle.anio} · {vehicle.combustible} · {vehicle.transmision}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--navy)' }}>{vehicle.precio?.toLocaleString('es-ES')} €</p>
            {vehicle.precioCompra && <p style={{ fontSize:12, color:'var(--grey-500)' }}>Compra: {vehicle.precioCompra.toLocaleString('es-ES')} €</p>}
          </div>
        </div>

        {/* Estado selector */}
        <div style={{ display:'flex', gap:6, marginTop:14, flexWrap:'wrap' }}>
          {['disponible','reservado','en_transito','vendido'].map(e => (
            <button key={e} className={`btn btn-sm ${vehicle.estado === e ? 'btn-navy' : 'btn-outline'}`}
              style={{ fontSize:12 }} onClick={() => handleEstado(e)}>
              {ESTADO_LABEL[e]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--grey-100)', borderRadius:'var(--radius-md)', padding:4 }}>
        {[['info','Informacion'], ['gastos','Gastos'], ['descripcion','Descripcion']].map(([k, l]) => (
          <button key={k} className={`btn btn-sm ${tab === k ? 'btn-navy' : 'btn-ghost'}`}
            style={{ flex:1, fontSize:13 }} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="fade-in">
          <div className="card" style={{ padding:20, marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--grey-500)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
              Caracteristicas tecnicas
            </h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px' }}>
              {[
                ['Kilómetros', `${vehicle.kilometros?.toLocaleString('es-ES')} km`],
                ['Color', vehicle.color || '—'],
                ['VIN', vehicle.vin || '—'],
                ['Ubicación', vehicle.ubicacion],
                ['Combustible', vehicle.combustible],
                ['Transmision', vehicle.transmision],
              ].map(([k, v]) => (
                <div key={k} style={{ paddingBottom:10, borderBottom:'1px solid var(--grey-100)' }}>
                  <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{k}</p>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'var(--navy)', marginTop:2 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {vehicle.extras?.length > 0 && (
            <div className="card" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--grey-500)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
                Extras y equipamiento
              </h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {vehicle.extras.map((e, i) => (
                  <span key={i} className="badge badge-navy" style={{ fontSize:12 }}>{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'gastos' && (
        <div className="fade-in">
          {/* Resumen economico */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
            {[
              { l:'Precio venta', v:`${vehicle.precio?.toLocaleString('es-ES')} €`, c:'var(--navy)' },
              { l:'Total gastos', v:`${totalGastos.toLocaleString('es-ES')} €`, c:'var(--red)' },
              { l:'Margen estimado', v: margenReal !== null ? `${margenReal.toLocaleString('es-ES')} €` : '—', c: margenReal > 0 ? '#2e7d32' : 'var(--red)' },
            ].map(x => (
              <div key={x.l} className="card" style={{ padding:'12px 14px' }}>
                <p style={{ fontSize:10, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{x.l}</p>
                <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:x.c, marginTop:4 }}>{x.v}</p>
              </div>
            ))}
          </div>

          {/* Nuevo gasto */}
          <div className="card" style={{ padding:20, marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--grey-500)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
              Registrar gasto
            </h3>
            <form onSubmit={handleGasto} style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div className="form-group">
                  <label className="form-label">Concepto</label>
                  <select className="form-input form-select" value={gastoForm.concepto}
                    onChange={e => setGastoForm(f => ({ ...f, concepto: e.target.value }))}>
                    {['Precio compra','Transporte Alemania','Transporte España','Homologación','ITV','Matrícula','Arancel importación','IVA importación','Reparación','Limpieza / Preparación','Seguro transporte','Gestión documental','Otros']
                      .map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Importe (€)</label>
                  <input className="form-input" type="number" placeholder="0.00" step="0.01" required
                    value={gastoForm.importe} onChange={e => setGastoForm(f => ({ ...f, importe: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción (opcional)</label>
                <input className="form-input" placeholder="Detalle del gasto..." value={gastoForm.descripcion}
                  onChange={e => setGastoForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type="checkbox" id="pagado" checked={gastoForm.pagado}
                  onChange={e => setGastoForm(f => ({ ...f, pagado: e.target.checked }))} />
                <label htmlFor="pagado" style={{ fontSize:13, color:'var(--grey-700)' }}>Gasto ya pagado</label>
              </div>
              <button className="btn btn-primary btn-sm" type="submit" disabled={savingGasto}>
                {savingGasto ? <span className="spinner" style={{ width:16, height:16, borderTopColor:'white' }} /> : '+ Registrar gasto'}
              </button>
            </form>
          </div>

          {/* Lista gastos */}
          {gastos.length > 0 ? (
            <div className="card">
              {gastos.map((g, i) => (
                <div key={g._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom: i < gastos.length-1 ? '1px solid var(--grey-100)' : 'none' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{g.concepto}</p>
                    {g.descripcion && <p style={{ fontSize:12, color:'var(--grey-500)' }}>{g.descripcion}</p>}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>{g.importe?.toLocaleString('es-ES')} €</p>
                    <button style={{ fontSize:11, color: g.pagado ? '#2e7d32' : 'var(--grey-500)', background:'none', border:'none', cursor:'pointer' }}
                      onClick={() => togglePagado(g)}>{g.pagado ? 'Pagado' : 'Pendiente'}</button>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteGasto(g._id)} style={{ color:'var(--red)', padding:'6px' }}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><h3>Sin gastos registrados</h3><p>Registra los gastos asociados a este vehículo</p></div>
          )}
        </div>
      )}

      {tab === 'descripcion' && (
        <div className="card fade-in" style={{ padding:20 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--grey-500)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>Descripción del vehículo</h3>
          <p style={{ color:'var(--grey-700)', lineHeight:1.7 }}>{vehicle.descripcion || 'Sin descripción registrada.'}</p>
        </div>
      )}
    </div>
  );
}

function BackIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function EditIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function PdfIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>; }
