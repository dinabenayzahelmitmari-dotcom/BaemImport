
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = !!id;

  const [form, setForm] = useState({
    cliente: '', vehiculo: '', pedido: '',
    conceptos: [{ descripcion:'', cantidad:1, precioUnitario:'', iva:21 }],
    metodoPago: 'Transferencia bancaria', notas: '',
  });
  const [clientes, setClientes]   = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/api/clients'),
      axios.get('/api/vehicles'),
    ]).then(([c, v]) => { setClientes(c.data); setVehiculos(v.data); });

    if (editing) {
      axios.get(`/api/invoices/${id}`).then(r => {
        const inv = r.data;
        setForm({
          cliente: inv.cliente?._id || inv.cliente || '',
          vehiculo: inv.vehiculo?._id || inv.vehiculo || '',
          pedido: inv.pedido?._id || inv.pedido || '',
          conceptos: inv.conceptos || [{ descripcion:'', cantidad:1, precioUnitario:'', iva:21 }],
          metodoPago: inv.metodoPago || 'Transferencia bancaria',
          notas: inv.notas || '',
        });
      });
    }
  }, [id]);

  const addConcepto = () => setForm(f => ({ ...f, conceptos: [...f.conceptos, { descripcion:'', cantidad:1, precioUnitario:'', iva:21 }] }));
  const removeConcepto = (i) => setForm(f => ({ ...f, conceptos: f.conceptos.filter((_, idx) => idx !== i) }));
  const updateConcepto = (i, k, v) => setForm(f => ({ ...f, conceptos: f.conceptos.map((c, idx) => idx === i ? { ...c, [k]: v } : c) }));

  const subtotal  = form.conceptos.reduce((s, c) => s + (parseFloat(c.cantidad)||0) * (parseFloat(c.precioUnitario)||0), 0);
  const totalIva  = form.conceptos.reduce((s, c) => s + (parseFloat(c.cantidad)||0) * (parseFloat(c.precioUnitario)||0) * ((parseFloat(c.iva)||0)/100), 0);
  const total     = subtotal + totalIva;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = {
        ...form,
        conceptos: form.conceptos.map(c => ({
          ...c, cantidad: parseFloat(c.cantidad), precioUnitario: parseFloat(c.precioUnitario), iva: parseFloat(c.iva),
        })),
      };
      if (!data.vehiculo) delete data.vehiculo;
      if (!data.pedido) delete data.pedido;
      if (editing) { await axios.put(`/api/invoices/${id}`, data); }
      else         { await axios.post('/api/invoices', data); }
      navigate('/invoices');
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/invoices')}>Atras</button>
      </div>

      <div className="card fade-in fade-in-1" style={{ padding:24, marginTop:8 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:4 }}>
          {editing ? 'Editar factura' : 'Nueva factura'}
        </h1>
        <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>Los totales se calculan automaticamente</p>

        {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select className="form-input form-select" required value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellidos || ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehiculo asociado</label>
              <select className="form-input form-select" value={form.vehiculo} onChange={e => setForm(f => ({ ...f, vehiculo: e.target.value }))}>
                <option value="">Sin vehiculo</option>
                {vehiculos.map(v => <option key={v._id} value={v._id}>{v.marca} {v.modelo} {v.anio}</option>)}
              </select>
            </div>
          </div>

          {/* Lineas de factura */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <p style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--grey-500)', letterSpacing:'0.8px', textTransform:'uppercase' }}>Lineas de factura</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={addConcepto}>+ Anadir linea</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {form.conceptos.map((c, i) => (
                <div key={i} className="card" style={{ padding:'12px 14px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', gap:8, alignItems:'end' }}>
                    <div className="form-group" style={{ margin:0 }}>
                      <label className="form-label">Descripcion</label>
                      <input className="form-input" required value={c.descripcion} placeholder="Descripcion del concepto..." onChange={e => updateConcepto(i, 'descripcion', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin:0, width:60 }}>
                      <label className="form-label">Cant.</label>
                      <input className="form-input" type="number" min="1" value={c.cantidad} onChange={e => updateConcepto(i, 'cantidad', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin:0, width:100 }}>
                      <label className="form-label">Precio unit.</label>
                      <input className="form-input" type="number" step="0.01" required value={c.precioUnitario} placeholder="0.00" onChange={e => updateConcepto(i, 'precioUnitario', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin:0, width:70 }}>
                      <label className="form-label">IVA %</label>
                      <select className="form-input form-select" value={c.iva} onChange={e => updateConcepto(i, 'iva', e.target.value)}>
                        <option value="0">0%</option>
                        <option value="10">10%</option>
                        <option value="21">21%</option>
                      </select>
                    </div>
                    {form.conceptos.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeConcepto(i)} style={{ marginBottom:0 }}>x</button>
                    )}
                  </div>
                  <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:6, textAlign:'right' }}>
                    Subtotal: {((parseFloat(c.cantidad)||0) * (parseFloat(c.precioUnitario)||0)).toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div style={{ background:'var(--grey-50)', borderRadius:'var(--radius-md)', padding:16 }}>
            {[['Subtotal (sin IVA)', subtotal], ['IVA', totalIva]].map(([l, v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--grey-200)', fontSize:14, color:'var(--grey-700)' }}>
                <span>{l}</span>
                <span>{v.toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0', fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--navy)' }}>
              <span>TOTAL</span>
              <span>{total.toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Metodo de pago</label>
              <select className="form-input form-select" value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}>
                {['Transferencia bancaria','Efectivo','Tarjeta','Financiacion','Otro'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea className="form-input" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones adicionales..." />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'white' }} /> : (editing ? 'Guardar cambios' : 'Emitir factura')}
          </button>
        </form>
      </div>
    </div>
  );
}
