
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './DetailPage.css';

const DEFAULTS = {
  marca:'', modelo:'', anio: new Date().getFullYear(), precio:'', kilometros:'',
  combustible:'Gasolina', transmision:'Manual', color:'', vin:'', estado:'disponible',
  descripcion:'', precioCompra:'', ubicacion:'Alemania', extras:''
};

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  // Inicializar con DEFAULTS o con el estado pasado por la navegacion
  const [form, setForm] = useState(() => {
    if (location.state && !isEdit) {
      return { ...DEFAULTS, ...location.state };
    }
    return DEFAULTS;
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    axios.get(`/api/vehicles/${id}`)
      .then(res => setForm({ ...res.data, extras: res.data.extras?.join(', ') || '' }))
      .catch(() => navigate('/vehicles'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, extras: form.extras ? form.extras.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (isEdit) await axios.put(`/api/vehicles/${id}`, payload);
      else await axios.post('/api/vehicles', payload);
      navigate(isEdit ? `/vehicles/${id}` : '/vehicles');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
      setSaving(false);
    }
  };

  if (loading) return <div className="detail-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="page form-page">
      <button className="back-btn" onClick={() => navigate(isEdit ? `/vehicles/${id}` : '/vehicles')}>
        <BackIcon /> {isEdit ? 'Detalle' : 'Vehículos'}
      </button>
      <div className="page-header fade-in">
        <h1 className="page-title">{isEdit ? 'Editar vehículo' : 'Nuevo vehículo'}</h1>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section fade-in fade-in-1">
          <p className="form-section-title">Información básica</p>
          <div className="form-stack">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Marca *</label>
                <input className="form-input" value={form.marca} onChange={e => set('marca', e.target.value)} required placeholder="BMW" />
              </div>
              <div className="form-group">
                <label className="form-label">Modelo *</label>
                <input className="form-input" value={form.modelo} onChange={e => set('modelo', e.target.value)} required placeholder="Serie 3" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Año *</label>
                <input className="form-input" type="number" value={form.anio} onChange={e => set('anio', e.target.value)} required min="1990" max="2030" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Negro" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">VIN / Bastidor</label>
              <input className="form-input" value={form.vin} onChange={e => set('vin', e.target.value)} placeholder="WBA..." />
            </div>
          </div>
        </div>

        <div className="form-section fade-in fade-in-2">
          <p className="form-section-title">Características técnicas</p>
          <div className="form-stack">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Combustible *</label>
                <select className="form-input form-select" value={form.combustible} onChange={e => set('combustible', e.target.value)}>
                  {['Gasolina','Diésel','Híbrido','Eléctrico','GLP'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transmisión</label>
                <select className="form-input form-select" value={form.transmision} onChange={e => set('transmision', e.target.value)}>
                  <option>Manual</option><option>Automático</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kilómetros</label>
              <input className="form-input" type="number" value={form.kilometros} onChange={e => set('kilometros', e.target.value)} placeholder="0" min="0" />
            </div>
          </div>
        </div>

        <div className="form-section fade-in fade-in-3">
          <p className="form-section-title">Precios y estado</p>
          <div className="form-stack">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Precio venta (€) *</label>
                <input className="form-input" type="number" value={form.precio} onChange={e => set('precio', e.target.value)} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Precio compra (€)</label>
                <input className="form-input" type="number" value={form.precioCompra} onChange={e => set('precioCompra', e.target.value)} min="0" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-input form-select" value={form.estado} onChange={e => set('estado', e.target.value)}>
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="en_transito">En tránsito</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ubicación</label>
                <select className="form-input form-select" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}>
                  <option>Alemania</option>
                  <option>En tránsito</option>
                  <option>España</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section fade-in fade-in-4">
          <p className="form-section-title">Descripción y extras</p>
          <div className="form-stack">
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Describe el vehículo..." />
            </div>
            <div className="form-group">
              <label className="form-label">Extras (separados por coma)</label>
              <input className="form-input" value={form.extras} onChange={e => set('extras', e.target.value)} placeholder="Navegador, Techo solar, Cámara trasera" />
            </div>
          </div>
        </div>

        <div className="form-actions fade-in fade-in-4">
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }} /> : isEdit ? 'Guardar cambios' : 'Crear vehículo'}
          </button>
          <button type="button" className="btn btn-outline btn-full" onClick={() => navigate(isEdit ? `/vehicles/${id}` : '/vehicles')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function BackIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>; }
