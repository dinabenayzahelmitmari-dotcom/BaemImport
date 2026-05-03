import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function OrderForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState({ cliente: searchParams.get('cliente')||'', vehiculo:'', precioFinal:'', senial:'', estado:'confirmado', notas:'', fechaEntregaEstimada:'', metodoPago:'Transferencia bancaria' });
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([axios.get('/api/clients'), axios.get('/api/vehicles')]).then(([c, v]) => { setClientes(c.data); setVehiculos(v.data); });
    if (editing) {
      axios.get(`/api/orders/${id}`).then(r => {
        const o = r.data;
        setForm({ cliente: o.cliente?._id||o.cliente||'', vehiculo: o.vehiculo?._id||o.vehiculo||'', precioFinal: o.precioFinal||'', senial: o.senial||'', estado: o.estado||'confirmado', notas: o.notas||'', fechaEntregaEstimada: o.fechaEntregaEstimada?o.fechaEntregaEstimada.substring(0,10):'', metodoPago: o.metodoPago||'Transferencia bancaria' });
      });
    }
  }, [id]);

  const restante = (parseFloat(form.precioFinal)||0) - (parseFloat(form.senial)||0);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const data = { ...form, precioFinal: parseFloat(form.precioFinal), senial: parseFloat(form.senial)||0, restante };
      if (editing) { await axios.put(`/api/orders/${id}`, data); navigate(`/orders/${id}`); }
      else { const r = await axios.post('/api/orders', data); navigate(`/orders/${r.data._id}`); }
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(x => ({ ...x, [k]: e.target.value })) });

  return (
    <div className="page">
      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(editing ? `/orders/${id}` : '/orders')}>Atras</button>
      </div>
      <div className="card fade-in fade-in-1" style={{ padding:24, marginTop:8 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:4 }}>{editing ? 'Editar pedido' : 'Nuevo pedido'}</h1>
        <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>Gestiona el pedido de importacion</p>
        {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <select className="form-input form-select" required {...f('cliente')}>
                <option value="">Seleccionar...</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellidos||''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehiculo</label>
              <select className="form-input form-select" required {...f('vehiculo')}>
                <option value="">Seleccionar...</option>
                {vehiculos.map(v => <option key={v._id} value={v._id}>{v.marca} {v.modelo} {v.anio}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Precio final (EUR)</label>
              <input className="form-input" type="number" step="0.01" required {...f('precioFinal')} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Sena entregada (EUR)</label>
              <input className="form-input" type="number" step="0.01" {...f('senial')} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-input form-select" {...f('estado')}>
                <option value="presupuesto">Presupuesto</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_gestion">En gestion</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Metodo de pago</label>
              <select className="form-input form-select" {...f('metodoPago')}>
                {['Transferencia bancaria','Efectivo','Tarjeta','Financiacion','Otro'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de entrega estimada</label>
            <input className="form-input" type="date" {...f('fechaEntregaEstimada')} />
          </div>
          <div style={{ padding:'14px 16px', background:'var(--navy)', borderRadius:'var(--radius-md)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>PENDIENTE DE PAGO</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color: restante > 0 ? '#ff8a80' : '#69f0ae' }}>{restante.toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR</span>
          </div>
          <div className="form-group">
            <label className="form-label">Notas internas</label>
            <textarea className="form-input" rows={3} {...f('notas')} placeholder="Estado del tramite, documentos pendientes..." />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>{loading ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear pedido')}</button>
        </form>
      </div>
    </div>
  );
}