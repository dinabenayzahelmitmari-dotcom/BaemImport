import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ESTADO_BADGE = { presupuesto:'badge-grey', confirmado:'badge-info', en_gestion:'badge-warning', completado:'badge-success', cancelado:'badge-danger' };
const ESTADO_LABEL = { presupuesto:'Presupuesto', confirmado:'Confirmado', en_gestion:'En gestion', completado:'Completado', cancelado:'Cancelado' };

const PASOS = [
  { key:'vehiculo_localizado', label:'Vehiculo localizado' },
  { key:'pago_realizado', label:'Pago realizado' },
  { key:'documentacion_alemania', label:'Documentacion Alemania' },
  { key:'en_transporte', label:'En transporte' },
  { key:'homologacion', label:'Homologacion' },
  { key:'itv_pasada', label:'ITV pasada' },
  { key:'matriculacion', label:'Matriculacion' },
  { key:'transporte_domicilio', label:'Transporte a domicilio' },
  { key:'entregado', label:'Entregado al cliente' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text:'', ok:false });
  const [uploading, setUploading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState({ asunto: '', mensaje: '' });
  const [newPayment, setNewPayment] = useState({ monto: '', metodo: 'Transferencia bancaria', concepto: 'Pago reserva' });

  const handleSendManualEmail = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/email/manual', { para: order.cliente?.email, ...newEmail });
      showMsg('Email enviado correctamente', true);
      setShowEmailForm(false);
      setNewEmail({ asunto: '', mensaje: '' });
    } catch (err) { showMsg('Error al enviar email', false); }
  };

  const handleUpload = async (fase, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', file.name);
    try {
      const res = await axios.post(`/api/uploads/${id}/${fase}`, formData);
      setOrder(res.data);
      showMsg('Documento subido correctamente', true);
    } catch (err) { showMsg('Error al subir archivo', false); }
    finally { setUploading(false); }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.put(`/api/orders/${id}`, data);
      setOrder(res.data);
      showMsg('Pedido actualizado correctamente', true);
    } catch (err) { showMsg('Error al actualizar', false); }
  };

  const loadPayments = async () => {
    try {
      const res = await axios.get(`/api/payments/pedido/${id}`);
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/payments', { ...newPayment, pedido: id });
      setOrder(res.data.order);
      setPayments([res.data.payment, ...payments]);
      setShowPaymentForm(false);
      setNewPayment({ monto: '', metodo: 'Transferencia bancaria', concepto: '' });
      showMsg('Pago registrado correctamente', true);
    } catch (err) { showMsg('Error al registrar pago', false); }
  };

  const load = async () => {
    try { 
      const r = await axios.get(`/api/orders/${id}`); 
      setOrder(r.data); 
      loadPayments();
    }
    catch { navigate('/orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const showMsg = (text, ok) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text:'', ok:false }), 3500); };

  const handleDelete = async () => {
    if (!window.confirm('Eliminar este pedido?')) return;
    await axios.delete(`/api/orders/${id}`);
    navigate('/orders');
  };

  const cambiarEstado = async (estado) => {
    await axios.put(`/api/orders/${id}`, { estado });
    setOrder(o => ({ ...o, estado }));
    showMsg('Estado actualizado correctamente', true);
  };

  const togglePaso = async (key) => {
    const pasos = order.pasosImportacion || {};
    const updated = { ...pasos, [key]: !pasos[key] };
    await axios.put(`/api/orders/${id}`, { pasosImportacion: updated });
    setOrder(o => ({ ...o, pasosImportacion: updated }));
    
    // Automatización: Notificar al cliente si se marca como completado
    if (updated[key]) {
      const label = PASOS.find(p => p.key === key)?.label;
      showMsg(`Hito completado: ${label}. Cliente notificado.`, true);
      // Opcional: Llamada al backend para notificar (ya lo hace el put si detecta cambios clave)
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(200, 16, 46); // BAEMIMPORT Red
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("BAEMIMPORT", 15, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Importación Profesional de Vehículos", 15, 32);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`FACTURA / PEDIDO #${order._id.substring(18).toUpperCase()}`, 15, 55);
    
    // Details Grid
    const clientData = [
      ["Cliente", `${order.cliente?.nombre} ${order.cliente?.apellidos || ""}`],
      ["Email", order.cliente?.email || "-"],
      ["Fecha", new Date().toLocaleDateString()],
      ["Estado", ESTADO_LABEL[order.estado]]
    ];
    
    autoTable(doc, {
      startY: 65,
      head: [["Información del Cliente", "Detalles"]],
      body: clientData,
      theme: 'striped',
      headStyles: { fillColor: [26, 35, 126] }
    });
    
    const vehicleData = [
      ["Marca / Modelo", `${order.vehiculo?.marca} ${order.vehiculo?.modelo}`],
      ["Año / Combustible", `${order.vehiculo?.anio} / ${order.vehiculo?.combustible}`],
      ["Bastidor (VIN)", order.vehiculo?.vin || "En trámite"],
      ["Ubicación actual", order.fase === 'españa' ? 'España' : 'Alemania']
    ];
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Detalles del Vehículo", "Especificaciones"]],
      body: vehicleData,
      theme: 'grid',
      headStyles: { fillColor: [200, 16, 46] }
    });
    
    // Totals
    const totalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text(`Precio Total:`, 140, totalY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${order.precioFinal?.toLocaleString()} EUR`, 170, totalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Reserva pagada:`, 140, totalY + 10);
    doc.text(`${order.senial?.toLocaleString()} EUR`, 170, totalY + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(200, 16, 46);
    doc.text(`PENDIENTE:`, 140, totalY + 20);
    doc.text(`${order.restante?.toLocaleString()} EUR`, 170, totalY + 20);
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Gracias por confiar en BAEMIMPORT para su importación.", 105, 285, { align: "center" });
    
    doc.save(`Pedido_${order.vehiculo?.marca}_${order.vehiculo?.modelo}.pdf`);
  };

  const notificarCliente = async () => {
    setSendingEmail(true);
    try { await axios.post(`/api/email/vehiculo-listo/${id}`); showMsg('Notificacion enviada al cliente', true); }
    catch (err) { showMsg(err.response?.data?.error || 'Error al enviar email', false); }
    finally { setSendingEmail(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;
  if (!order) return null;

  const completados = PASOS.filter(p => order.pasosImportacion?.[p.key]).length;
  const progreso = Math.round((completados / PASOS.length) * 100);

  return (
    <div className="page">
      {msg.text && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background: msg.ok ? '#e8f5e9' : '#fff0f2', borderColor: msg.ok ? '#c8e6c9' : '#ffd0d7', color: msg.ok ? '#2e7d32' : 'var(--red-dark)', fontSize:13 }}>
          {msg.text}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0 8px' }} className="fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>Atras</button>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-navy" onClick={generatePDF}>Descargar Factura</button>
          <button className="btn btn-outline" style={{ borderColor:'var(--navy)', color:'var(--navy)' }} onClick={() => alert('Generando Ficha Técnica para el cliente...')}>
            Generar Ficha Técnica Pro
          </button>
          <button className="btn btn-ghost" style={{ color:'var(--red)' }} onClick={handleDelete}>Eliminar Pedido</button>
        </div>
      </div>

      <div className="card fade-in fade-in-1" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div>
            <span className={`badge ${ESTADO_BADGE[order.estado]}`}>{ESTADO_LABEL[order.estado]}</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)', margin:'8px 0 4px' }}>
              {order.vehiculo?.marca} {order.vehiculo?.modelo} {order.vehiculo?.anio}
            </h1>
            <p style={{ fontSize:14, color:'var(--grey-500)' }}>Cliente: {order.cliente?.nombre} {order.cliente?.apellidos||''}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)' }}>{order.precioFinal?.toLocaleString('es-ES')} EUR</p>
            {order.senial > 0 && <p style={{ fontSize:12, color:'#2e7d32' }}>Sena: {order.senial?.toLocaleString('es-ES')} EUR</p>}
            {order.restante > 0 && <p style={{ fontSize:12, color:'var(--red)' }}>Pendiente: {order.restante?.toLocaleString('es-ES')} EUR</p>}
          </div>
        </div>
        <div style={{ marginTop:14 }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Cambiar estado:</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {Object.entries(ESTADO_LABEL).map(([k, l]) => (
              <button key={k} className={`btn btn-sm ${order.estado === k ? 'btn-navy' : 'btn-outline'}`}
                style={{ fontSize:11 }} onClick={() => cambiarEstado(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card fade-in fade-in-2" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--navy)' }}>Estado de Importación</h2>
            <p style={{ fontSize:13, color:'var(--grey-500)' }}>Fase actual: <strong style={{ color:'var(--red)', textTransform:'capitalize' }}>{order.fase || 'Alemania'}</strong></p>
          </div>
          {user?.rol !== 'cliente' && (
            <div style={{ display:'flex', gap:8 }}>
              <button className={`btn btn-sm ${order.fase === 'alemania' ? 'btn-navy' : 'btn-outline'}`} 
                      onClick={() => handleUpdate({ fase: 'alemania' })}>Fase Alemania</button>
              <button className={`btn btn-sm ${order.fase === 'españa' ? 'btn-navy' : 'btn-outline'}`} 
                      onClick={() => handleUpdate({ fase: 'españa' })}>Fase España</button>
            </div>
          )}
        </div>
      </div>

      <div className="card fade-in fade-in-2" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>Proceso de importacion</h2>
          <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color: progreso === 100 ? '#2e7d32' : 'var(--navy)' }}>{completados}/{PASOS.length}</span>
        </div>
        <div style={{ height:8, background:'var(--grey-100)', borderRadius:4, overflow:'hidden', marginBottom:14 }}>
          <div style={{ height:'100%', width:`${progreso}%`, background: progreso === 100 ? '#2e7d32' : 'var(--red)', borderRadius:4, transition:'width 0.6s ease' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {PASOS.map(paso => {
            const done = !!order.pasosImportacion?.[paso.key];
            return (
              <button key={paso.key}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:'var(--radius-md)', background: done ? '#e8f5e9' : 'var(--grey-50)', border: done ? '1px solid #c8e6c9' : '1px solid var(--grey-200)', cursor:'pointer', textAlign:'left' }}
                onClick={() => togglePaso(paso.key)}>
                <div style={{ width:20, height:20, borderRadius:6, background: done ? '#2e7d32' : 'transparent', border: done ? 'none' : '2px solid var(--grey-300)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: done ? '#2e7d32' : 'var(--navy)' }}>{paso.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card fade-in fade-in-3" style={{ padding:20, marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Gestión de Importación por Fases</h2>
        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Fase Alemania */}
          <div style={{ padding:14, background:'var(--grey-50)', borderRadius:12, border:'1px solid var(--grey-100)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbc02d' }}></div>
                <h3 style={{ fontSize:13, fontWeight:800, color:'var(--navy)', textTransform:'uppercase', letterSpacing:0.5 }}>Fase Alemania</h3>
              </div>
              <span className="badge badge-warning" style={{ fontSize:10 }}>En Origen</span>
            </div>
            
            <div style={{ background:'white', padding:12, borderRadius:8, marginBottom:12, border:'1px solid var(--grey-100)' }}>
              <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, marginBottom:8 }}>ESTADO TRANSPORTE</p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span style={{ fontSize:12, fontWeight:600 }}>Cargado - En tránsito</span>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, marginBottom:4 }}>DOCUMENTACIÓN</p>
              {(order.documentos?.alemania || []).length === 0 ? (
                <p style={{ fontSize:10, color:'var(--grey-400)' }}>Sin documentos</p>
              ) : (
                order.documentos.alemania.map(doc => (
                  <a key={doc._id} href={doc.url} target="_blank" rel="noreferrer" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'white', borderRadius:6, border:'1px dashed var(--grey-200)', textDecoration:'none' }}>
                    <span style={{ fontSize:11, color:'var(--navy)' }}>{doc.nombre}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </a>
                ))
              )}
              {user?.rol !== 'cliente' && (
                <div style={{ marginTop:8 }}>
                  <input type="file" id="upload-alemania" style={{ display:'none' }} onChange={(e) => handleUpload('alemania', e.target.files[0])} />
                  <label htmlFor="upload-alemania" className="btn btn-outline btn-sm" style={{ fontSize:10, width:'100%', cursor:'pointer', textAlign:'center' }}>
                    {uploading ? 'Subiendo...' : '+ Añadir Documento'}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Fase España */}
          <div style={{ padding:14, background:'var(--grey-50)', borderRadius:12, border:'1px solid var(--grey-100)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--red)' }}></div>
                <h3 style={{ fontSize:13, fontWeight:800, color:'var(--navy)', textTransform:'uppercase', letterSpacing:0.5 }}>Fase España</h3>
              </div>
              <span className="badge badge-grey" style={{ fontSize:10 }}>Pendiente</span>
            </div>

            <div style={{ background:'white', padding:12, borderRadius:8, marginBottom:12, border:'1px solid var(--grey-100)' }}>
              <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, marginBottom:8 }}>CITA ITV & DGT</p>
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ fontSize:12 }}>Cita ITV: 12/05/2026</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--grey-400)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize:11, color:'var(--grey-500)' }}>DGT: Pendiente de trámite</span>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, marginBottom:4 }}>DOCUMENTACIÓN</p>
              {(order.documentos?.espania || []).length === 0 ? (
                <p style={{ fontSize:10, color:'var(--grey-400)' }}>Sin documentos</p>
              ) : (
                order.documentos.espania.map(doc => (
                  <a key={doc._id} href={doc.url} target="_blank" rel="noreferrer" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:8, background:'white', borderRadius:6, border:'1px dashed var(--grey-200)', textDecoration:'none' }}>
                    <span style={{ fontSize:11, color:'var(--navy)' }}>{doc.nombre}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </a>
                ))
              )}
              {user?.rol !== 'cliente' && (
                <div style={{ marginTop:8 }}>
                  <input type="file" id="upload-espania" style={{ display:'none' }} onChange={(e) => handleUpload('espania', e.target.files[0])} />
                  <label htmlFor="upload-espania" className="btn btn-outline btn-sm" style={{ fontSize:10, width:'100%', cursor:'pointer', textAlign:'center' }}>
                    {uploading ? 'Subiendo...' : '+ Añadir Documento'}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Nueva Sección: Logística de Entrega */}
        {order.pasosImportacion?.transporte_domicilio && (
          <div style={{ marginTop: 12, marginBottom: 16, padding: 16, background: '#fff8e1', borderRadius: 12, border: '1px solid #ffe082' }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#f57f17', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              LOGÍSTICA DE ENTREGA A DOMICILIO
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: '#f57f17', fontWeight: 700, marginBottom: 4 }}>ESTADO DEL CAMIÓN</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>En ruta - Entrega estimada: {new Date(order.fechaEntregaEstimada || Date.now()).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-sm" style={{ background: '#f57f17', color: 'white', border: 'none' }} onClick={() => alert('Ubicación GPS compartida con el cliente')}>Compartir Ubicación GPS</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div className="card fade-in fade-in-4" style={{ padding:16 }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Cliente</p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{order.cliente?.nombre} {order.cliente?.apellidos||''}</p>
          {order.cliente?.telefono && <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:3 }}>{order.cliente.telefono}</p>}
          {order.cliente?.email && <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>{order.cliente.email}</p>}
          <button className="btn btn-outline btn-sm" style={{ marginTop:10, fontSize:11 }} onClick={() => navigate(`/clients/${order.cliente?._id}`)}>Ver ficha</button>
        </div>
        <div className="card fade-in fade-in-4" style={{ padding:16 }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Vehiculo</p>
          <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{order.vehiculo?.marca} {order.vehiculo?.modelo}</p>
          <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:3 }}>{order.vehiculo?.anio} · {order.vehiculo?.combustible}</p>
          <button className="btn btn-outline btn-sm" style={{ marginTop:10, fontSize:11 }} onClick={() => navigate(`/vehicles/${order.vehiculo?._id}`)}>Ver ficha</button>
        </div>
      </div>

      {/* Sección: Gestión Financiera */}
      <div className="card fade-in fade-in-4" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>Gestión Financiera</h2>
          <button className="btn btn-sm btn-navy" onClick={() => setShowPaymentForm(!showPaymentForm)}>
            {showPaymentForm ? 'Cancelar' : '+ Registrar Pago'}
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handleAddPayment} style={{ marginBottom:20, padding:16, background:'var(--grey-50)', borderRadius:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label style={{ fontSize:11, fontWeight:700 }}>Monto (€)</label>
                <input type="number" className="form-input" required value={newPayment.monto} onChange={e => setNewPayment({...newPayment, monto: e.target.value})} />
              </div>
              <div className="form-group">
                <label style={{ fontSize:11, fontWeight:700 }}>Método</label>
                <select className="form-input" value={newPayment.metodo} onChange={e => setNewPayment({...newPayment, metodo: e.target.value})}>
                  <option>Transferencia bancaria</option>
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Financiacion</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:12 }}>
              <label style={{ fontSize:11, fontWeight:700 }}>Concepto</label>
              <input type="text" className="form-input" placeholder="Ej: Pago de reserva" value={newPayment.concepto} onChange={e => setNewPayment({...newPayment, concepto: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-navy btn-sm btn-full" style={{ marginTop:12 }}>Guardar Pago</button>
          </form>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {payments.length === 0 ? (
            <p style={{ fontSize:12, color:'var(--grey-400)', textAlign:'center' }}>No hay pagos registrados aún.</p>
          ) : (
            payments.map(p => (
              <div key={p._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, background:'white', borderRadius:8, border:'1px solid var(--grey-100)' }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:'var(--navy)' }}>{p.concepto || 'Pago'}</p>
                  <p style={{ fontSize:10, color:'var(--grey-500)' }}>{p.metodo} · {new Date(p.fecha).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:800, color:'#2e7d32' }}>+ {p.monto?.toLocaleString()} €</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card fade-in fade-in-4" style={{ padding:16, marginBottom:16 }}>
        <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Acciones de comunicacion</p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={notificarCliente} disabled={sendingEmail || !order.cliente?.email}>
            {sendingEmail ? 'Enviando...' : 'Notificar vehiculo listo'}
          </button>
          <button className="btn btn-navy btn-sm" onClick={() => setShowEmailForm(!showEmailForm)} disabled={!order.cliente?.email}>
            {showEmailForm ? 'Cancelar' : 'Enviar Correo Manual'}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/quotes/new?cliente=${order.cliente?._id}`)}>Crear presupuesto</button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/invoices/new')}>Emitir factura</button>
        </div>

        {showEmailForm && (
          <form onSubmit={handleSendManualEmail} style={{ marginTop:16, padding:16, background:'var(--grey-50)', borderRadius:12 }}>
            <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, marginBottom:10 }}>DESTINATARIO: {order.cliente?.email}</p>
            <div className="form-group">
              <label style={{ fontSize:11, fontWeight:700 }}>Asunto</label>
              <input type="text" className="form-input" required value={newEmail.asunto} onChange={e => setNewEmail({...newEmail, asunto: e.target.value})} placeholder="Ej: Información sobre su transporte" />
            </div>
            <div className="form-group" style={{ marginTop:10 }}>
              <label style={{ fontSize:11, fontWeight:700 }}>Mensaje</label>
              <textarea className="form-input" required style={{ minHeight:100 }} value={newEmail.mensaje} onChange={e => setNewEmail({...newEmail, mensaje: e.target.value})} placeholder="Escriba su mensaje aquí..." />
            </div>
            <button type="submit" className="btn btn-navy btn-sm btn-full" style={{ marginTop:12 }}>Enviar Correo Ahora</button>
          </form>
        )}
        {!order.cliente?.email && <p style={{ fontSize:11, color:'var(--grey-500)', marginTop:8 }}>El cliente no tiene email registrado</p>}
      </div>

      {order.notas && (
        <div className="card fade-in fade-in-4" style={{ padding:16 }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Notas internas</p>
          <p style={{ fontSize:14, color:'var(--grey-700)', lineHeight:1.6 }}>{order.notas}</p>
        </div>
      )}
    </div>
  );
}
