
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function QuoteForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editing = !!id;

  const [form, setForm] = useState({
    cliente: searchParams.get('cliente') || '',
    vehiculo: '',
    descripcionVehiculo: '',
    precioBase: '',
    descuento: '',
    gastosTransporte: '',
    gastosGestion: '',
    gastosMatriculacion: '',
    otrosGastos: '',
    precioFinal: '',
    validezDias: '15',
    notas: '',
    condiciones: 'Precios indicados sin IVA salvo que se indique lo contrario. Presupuesto sujeto a disponibilidad del vehiculo.',
  });
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/api/clients'),
      axios.get('/api/vehicles?estado=disponible'),
    ]).then(([c, v]) => {
      setClientes(c.data);
      setVehiculos(v.data);
    });

    if (editing) {
      axios.get(`/api/quotes/${id}`).then(r => {
        const q = r.data;
        setForm({
          cliente: q.cliente?._id || q.cliente || '',
          vehiculo: q.vehiculo?._id || q.vehiculo || '',
          descripcionVehiculo: q.descripcionVehiculo || '',
          precioBase: q.precioBase || '',
          descuento: q.descuento || '',
          gastosTransporte: q.gastosTransporte || '',
          gastosGestion: q.gastosGestion || '',
          gastosMatriculacion: q.gastosMatriculacion || '',
          otrosGastos: q.otrosGastos || '',
          precioFinal: q.precioFinal || '',
          validezDias: q.validezDias || '15',
          notas: q.notas || '',
          condiciones: q.condiciones || '',
        });
      });
    }
  }, [id]);

  // Calcular precio final automaticamente
  useEffect(() => {
    const base  = parseFloat(form.precioBase) || 0;
    const desc  = parseFloat(form.descuento) || 0;
    const trans = parseFloat(form.gastosTransporte) || 0;
    const gest  = parseFloat(form.gastosGestion) || 0;
    const matr  = parseFloat(form.gastosMatriculacion) || 0;
    const otros = parseFloat(form.otrosGastos) || 0;
    const total = base - desc + trans + gest + matr + otros;
    if (base > 0) setForm(f => ({ ...f, precioFinal: total.toFixed(2) }));
  }, [form.precioBase, form.descuento, form.gastosTransporte, form.gastosGestion, form.gastosMatriculacion, form.otrosGastos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = { ...form };
      ['precioBase','descuento','gastosTransporte','gastosGestion','gastosMatriculacion','otrosGastos','precioFinal','validezDias'].forEach(k => {
        if (data[k] !== '') data[k] = parseFloat(data[k]);
      });
      if (!data.vehiculo) delete data.vehiculo;
      if (editing) { await axios.put(`/api/quotes/${id}`, data); }
      else         { await axios.post('/api/quotes', data); }
      navigate('/quotes');
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(x => ({ ...x, [k]: e.target.value })) });

  return (
    <div className="page">
      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quotes')}>Atras</button>
      </div>

      <div className="card fade-in fade-in-1" style={{ padding:24, marginTop:8 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:4 }}>
          {editing ? 'Editar presupuesto' : 'Nuevo presupuesto'}
        </h1>
        <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>
          El precio final se calcula automaticamente
        </p>

        {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select className="form-input form-select" required {...f('cliente')}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellidos || ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehiculo (si aplica)</label>
              <select className="form-input form-select" {...f('vehiculo')}>
                <option value="">Sin vehiculo asignado</option>
                {vehiculos.map(v => <option key={v._id} value={v._id}>{v.marca} {v.modelo} {v.anio}</option>)}
              </select>
            </div>
          </div>

          {!form.vehiculo && (
            <div className="form-group">
              <label className="form-label">Descripcion del vehiculo</label>
              <input className="form-input" {...f('descripcionVehiculo')} placeholder="ej: BMW Serie 3 2021 Automatico Diesel..." />
            </div>
          )}

          <div style={{ background:'var(--grey-50)', borderRadius:'var(--radius-md)', padding:16 }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--grey-500)', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:12 }}>Desglose economico</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Precio base (EUR) *</label>
                <input className="form-input" type="number" step="0.01" required {...f('precioBase')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Descuento (EUR)</label>
                <input className="form-input" type="number" step="0.01" {...f('descuento')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Gastos de transporte</label>
                <input className="form-input" type="number" step="0.01" {...f('gastosTransporte')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Gastos de gestion</label>
                <input className="form-input" type="number" step="0.01" {...f('gastosGestion')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Gastos matriculacion</label>
                <input className="form-input" type="number" step="0.01" {...f('gastosMatriculacion')} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Otros gastos</label>
                <input className="form-input" type="number" step="0.01" {...f('otrosGastos')} placeholder="0.00" />
              </div>
            </div>

            <div style={{ marginTop:12, padding:'14px 16px', background:'var(--navy)', borderRadius:'var(--radius-md)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.7)' }}>PRECIO FINAL TOTAL</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'white' }}>
                {parseFloat(form.precioFinal || 0).toLocaleString('es-ES', { minimumFractionDigits:2 })} EUR
              </span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Validez (dias)</label>
              <input className="form-input" type="number" {...f('validezDias')} placeholder="15" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notas adicionales</label>
            <textarea className="form-input" {...f('notas')} rows={3} placeholder="Observaciones para el cliente..." />
          </div>
          <div className="form-group">
            <label className="form-label">Condiciones generales</label>
            <textarea className="form-input" {...f('condiciones')} rows={3} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'white' }} /> : (editing ? 'Guardar cambios' : 'Crear presupuesto')}
          </button>
        </form>
      </div>
    </div>
  );
}
