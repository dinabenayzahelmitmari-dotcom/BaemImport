
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PRIORIDAD_BADGE = { baja:'badge-grey', normal:'badge-info', alta:'badge-warning', urgente:'badge-danger' };
const PRIORIDAD_LABEL = { baja:'Baja', normal:'Normal', alta:'Alta', urgente:'Urgente' };
const ESTADO_BADGE    = { pendiente:'badge-grey', en_progreso:'badge-info', completada:'badge-success', cancelada:'badge-danger' };
const ESTADO_LABEL    = { pendiente:'Pendiente', en_progreso:'En progreso', completada:'Completada', cancelada:'Cancelada' };
const CATEGORIA_LABEL = {
  Importacion: 'Importación',
  Documentacion: 'Documentación',
  Cliente: 'Cliente',
  Vehiculo: 'Vehículo',
  Financiero: 'Financiero',
  Otro: 'Otro',
};

const EMPTY_FORM = { titulo:'', descripcion:'', prioridad:'normal', categoria:'Otro', estado:'pendiente', fechaLimite:'' };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState('pendiente');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = () => {
    setLoading(true);
    const params = filtro ? `?estado=${filtro}` : '';
    axios.get(`/api/tasks${params}`)
      .then(r => setTasks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filtro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axios.post('/api/tasks', form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) { setError(err.response?.data?.error || 'Error al crear la tarea'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (task, estado) => {
    await axios.put(`/api/tasks/${task._id}`, { estado });
    load();
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    await axios.delete(`/api/tasks/${id}`);
    load();
  };

  const pendientes   = tasks.filter(t => t.estado === 'pendiente').length;
  const en_progreso  = tasks.filter(t => t.estado === 'en_progreso').length;
  const urgentes     = tasks.filter(t => t.prioridad === 'urgente').length;

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div><h1 className="page-title">Tareas</h1><p className="page-subtitle">{pendientes} pendientes · {en_progreso} en progreso</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva tarea'}
          </button>
        </div>
      </div>

      {urgentes > 0 && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background:'#fff0f2', borderColor:'#ffd0d7', borderLeft:'3px solid var(--red)' }}>
          <p style={{ fontSize:13, color:'var(--red-dark)', fontWeight:600 }}>Hay {urgentes} tarea{urgentes>1?'s':''} urgente{urgentes>1?'s':''} sin resolver</p>
        </div>
      )}

      {/* Formulario nueva tarea */}
      {showForm && (
        <div className="card fade-in" style={{ padding:20, marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Nueva tarea</h3>
          {error && <div style={{ background:'#fff0f2', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className="form-input" required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Describe la tarea brevemente..." />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="form-input form-select" value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select className="form-input form-select" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha limite</label>
                <input className="form-input" type="date" value={form.fechaLimite} onChange={e => setForm(f => ({ ...f, fechaLimite: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-input" rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Detalles adicionales..." />
            </div>
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear tarea'}
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }} className="fade-in fade-in-1">
        {[['','Todas'],['pendiente','Pendientes'],['en_progreso','En progreso'],['completada','Completadas']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filtro === v ? 'btn-navy' : 'btn-outline'}`} style={{ fontSize:12 }}
            onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>

      {/* Lista tareas */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state"><h3>Sin tareas</h3><p>No hay tareas con el filtro seleccionado</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {tasks.map((t, i) => (
            <div key={t._id} className={`card fade-in fade-in-${Math.min(i+1,4)}`} style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                {/* Checkbox completar */}
                <button
                  style={{ width:22, height:22, borderRadius:6, border: t.estado === 'completada' ? 'none' : '2px solid var(--grey-300)', background: t.estado === 'completada' ? '#2e7d32' : 'transparent', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:2 }}
                  onClick={() => cambiarEstado(t, t.estado === 'completada' ? 'pendiente' : 'completada')}>
                  {t.estado === 'completada' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                    <span className={`badge ${PRIORIDAD_BADGE[t.prioridad]}`}>{PRIORIDAD_LABEL[t.prioridad]}</span>
                    <span className={`badge ${ESTADO_BADGE[t.estado]}`}>{ESTADO_LABEL[t.estado]}</span>
                    <span className="badge badge-grey" style={{ fontSize:10 }}>{CATEGORIA_LABEL[t.categoria] || t.categoria}</span>
                  </div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color: t.estado === 'completada' ? 'var(--grey-500)' : 'var(--navy)', textDecoration: t.estado === 'completada' ? 'line-through' : 'none' }}>
                    {t.titulo}
                  </p>
                  {t.descripcion && <p style={{ fontSize:12, color:'var(--grey-500)', marginTop:4, lineHeight:1.5 }}>{t.descripcion}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:6 }}>
                    {t.fechaLimite && (
                      <span style={{ fontSize:11, color: new Date(t.fechaLimite) < new Date() && t.estado !== 'completada' ? 'var(--red)' : 'var(--grey-500)', fontWeight:600 }}>
                        Límite: {new Date(t.fechaLimite).toLocaleDateString('es-ES')}
                      </span>
                    )}
                    {t.asignadoA && <span style={{ fontSize:11, color:'var(--grey-500)' }}>Asignado a: {t.asignadoA.nombre}</span>}
                  </div>
                </div>

                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  {t.estado === 'pendiente' && (
                    <button className="btn btn-outline btn-sm" style={{ fontSize:11, padding:'4px 8px' }}
                      onClick={() => cambiarEstado(t, 'en_progreso')}>Iniciar</button>
                  )}
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--red)', padding:'6px' }}
                    onClick={() => eliminar(t._id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
