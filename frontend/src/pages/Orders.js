
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ESTADO_BADGE = { presupuesto:'badge-grey', confirmado:'badge-info', en_gestion:'badge-warning', completado:'badge-success', cancelado:'badge-danger' };
const ESTADO_LABEL = { presupuesto:'Presupuesto', confirmado:'Confirmado', en_gestion:'En gestion', completado:'Completado', cancelado:'Cancelado' };

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  const load = () => {
    setLoading(true);
    const params = filtroEstado ? `?estado=${filtroEstado}` : '';
    axios.get(`/api/orders${params}`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filtroEstado]);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div><h1 className="page-title">Pedidos</h1><p className="page-subtitle">{orders.length} en total</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders/new')}>+ Nuevo</button>
        </div>
      </div>

      {/* Filtro estado */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }} className="fade-in fade-in-1">
        {[['', 'Todos'], ['presupuesto','Presupuesto'], ['confirmado','Confirmado'], ['en_gestion','En gestion'], ['completado','Completado'], ['cancelado','Cancelado']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filtroEstado === v ? 'btn-navy' : 'btn-outline'}`} style={{ fontSize:12 }}
            onClick={() => setFiltroEstado(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>Sin pedidos</h3>
          <p>No hay pedidos con el filtro seleccionado</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders/new')}>Nuevo pedido</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {orders.map((o, i) => (
            <div key={o._id} className={`card card-pressable fade-in fade-in-${Math.min(i+1,4)}`}
              style={{ padding:'14px 16px' }} onClick={() => navigate(`/orders/${o._id}`)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span className={`badge ${ESTADO_BADGE[o.estado]}`}>{ESTADO_LABEL[o.estado]}</span>
                    <span style={{ fontSize:11, color:'var(--grey-500)' }}>{new Date(o.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>
                    {o.vehiculo?.marca} {o.vehiculo?.modelo} {o.vehiculo?.anio}
                  </p>
                  <p style={{ fontSize:13, color:'var(--grey-500)', marginTop:2 }}>
                    {o.cliente?.nombre} {o.cliente?.apellidos || ''}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, color:'var(--navy)' }}>
                    {o.precioFinal?.toLocaleString('es-ES')} EUR
                  </p>
                  {o.restante > 0 && (
                    <p style={{ fontSize:11, color:'var(--red)' }}>Pendiente: {o.restante?.toLocaleString('es-ES')} EUR</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
