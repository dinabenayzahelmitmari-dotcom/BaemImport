import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DetailPage.css';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ asunto:'', mensaje:'' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [msg, setMsg] = useState({ text:'', ok:false });

  useEffect(() => {
    Promise.all([
      axios.get(`/api/clients/${id}`),
      axios.get('/api/orders').catch(() => ({ data: [] })),
    ]).then(([c, o]) => {
      setClient(c.data);
      const clientOrders = o.data.filter(order => 
        order.cliente?._id === id || order.cliente === id
      );
      setOrders(clientOrders);
    }).catch(() => navigate('/clients'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Eliminar este cliente?')) return;
    await axios.delete(`/api/clients/${id}`);
    navigate('/clients');
  };

  const sendBienvenida = async () => {
    try {
      await axios.post(`/api/email/bienvenida/${id}`);
      setMsg({ text:'Email de bienvenida enviado correctamente', ok:true });
    } catch (err) { setMsg({ text: err.response?.data?.error || 'Error al enviar', ok:false }); }
    setTimeout(() => setMsg({ text:'', ok:false }), 3000);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      await axios.post(`/api/email/seguimiento/${id}`, emailForm);
      setMsg({ text:'Email enviado correctamente', ok:true });
      setEmailModal(false);
      setEmailForm({ asunto:'', mensaje:'' });
    } catch (err) { setMsg({ text: err.response?.data?.error || 'Error al enviar', ok:false }); }
    finally { setSendingEmail(false); }
    setTimeout(() => setMsg({ text:'', ok:false }), 3000);
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><div className="spinner" style={{ width:36, height:36 }} /></div>;
  if (!client) return null;

  return (
    <div className="page">
      {msg.text && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background: msg.ok ? '#e8f5e9' : '#fff0f2', borderColor: msg.ok ? '#c8e6c9' : '#ffd0d7', color: msg.ok ? '#2e7d32' : 'var(--red-dark)', fontSize:13 }}>
          {msg.text}
        </div>
      )}
      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}>Atras</button>
        <div className="detail-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/clients/${id}/edit`)}>Editar</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Eliminar</button>
        </div>
      </div>

      <div className="card fade-in fade-in-1" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--navy)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, flexShrink:0 }}>
            {client.nombre?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)' }}>{client.nombre} {client.apellidos || ''}</h1>
            {client.dni && <p style={{ fontSize:13, color:'var(--grey-500)' }}>DNI/NIE: {client.dni}</p>}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 16px' }}>
          {[['Telefono', client.telefono], ['Email', client.email], ['Direccion', client.direccion], ['Ciudad', client.ciudad]].filter(([,v]) => v).map(([k, v]) => (
            <div key={k}>
              <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{k}</p>
              <p style={{ fontSize:14, color:'var(--navy)', marginTop:2 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16, flexWrap:'wrap' }}>
          {client.email && (
            <>
              <button className="btn btn-outline btn-sm" onClick={sendBienvenida}>Enviar bienvenida</button>
              <button className="btn btn-outline btn-sm" onClick={() => setEmailModal(true)}>Email personalizado</button>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders/new')}>+ Nuevo pedido</button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/quotes/new')}>+ Presupuesto</button>
        </div>
      </div>

      {client.notas && (
        <div className="card fade-in fade-in-2" style={{ padding:16, marginBottom:16 }}>
          <p style={{ fontSize:11, color:'var(--grey-500)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Notas internas</p>
          <p style={{ fontSize:14, color:'var(--grey-700)', lineHeight:1.6 }}>{client.notas}</p>
        </div>
      )}

      <div className="fade-in fade-in-3">
        <p style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--grey-500)', letterSpacing:'1.2px', textTransform:'uppercase', marginBottom:10 }}>Pedidos ({orders.length})</p>
        {orders.length === 0 ? (
          <div className="empty-state" style={{ padding:'32px 24px' }}><h3>Sin pedidos</h3><p>Este cliente no tiene pedidos aun</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {orders.map(o => (
              <div key={o._id} className="card card-pressable" style={{ padding:'14px 16px' }} onClick={() => navigate(`/orders/${o._id}`)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{o.vehiculo?.marca} {o.vehiculo?.modelo}</p>
                    <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:2 }}>{new Date(o.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>{o.precioFinal?.toLocaleString('es-ES')} EUR</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {emailModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="card fade-in" style={{ width:'100%', maxWidth:440, padding:24 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--navy)', marginBottom:20 }}>Email a {client.nombre}</h2>
            <form onSubmit={sendEmail} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Asunto</label>
                <input className="form-input" required value={emailForm.asunto} onChange={e => setEmailForm(f => ({ ...f, asunto: e.target.value }))} placeholder="Asunto del email..." />
              </div>
              <div className="form-group">
                <label className="form-label">Mensaje</label>
                <textarea className="form-input" required rows={5} value={emailForm.mensaje} onChange={e => setEmailForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Escribe tu mensaje..." />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-outline btn-sm" type="button" onClick={() => setEmailModal(false)}>Cancelar</button>
                <button className="btn btn-primary btn-full" type="submit" disabled={sendingEmail}>{sendingEmail ? 'Enviando...' : 'Enviar email'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
