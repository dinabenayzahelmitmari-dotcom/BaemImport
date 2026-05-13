
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ nombre:'', email:'', password:'', rol:'empleado' });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState({ text:'', ok:false });

  const load = () => {
    axios.get('/api/auth/users')
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, ok) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text:'', ok:false }), 3000); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/auth/register', form);
      setForm({ nombre:'', email:'', password:'', rol:'empleado' });
      load();
      showMsg('Usuario creado correctamente', true);
    } catch (err) { showMsg(err.response?.data?.error || 'Error al crear usuario', false); }
    finally { setSaving(false); }
  };

  const toggleRole = async (u) => {
    const newRol = u.rol === 'admin' ? 'empleado' : 'admin';
    await axios.put(`/api/auth/users/${u._id}`, { rol: newRol });
    load();
  };

  const deleteUser = async (u) => {
    if (u._id === user._id) return showMsg('No puedes eliminar tu propio usuario', false);
    if (!window.confirm(`Eliminar al usuario ${u.nombre}?`)) return;
    await axios.delete(`/api/auth/users/${u._id}`);
    load();
    showMsg('Usuario eliminado', true);
  };

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div><h1 className="page-title">Ajustes</h1><p className="page-subtitle">Administracion del sistema</p></div>
      </div>

      {msg.text && (
        <div className="card fade-in" style={{ padding:'12px 16px', marginBottom:12, background: msg.ok ? '#e8f5e9' : '#fff0f2', borderColor: msg.ok ? '#c8e6c9' : '#ffd0d7', color: msg.ok ? '#2e7d32' : 'var(--red-dark)', fontSize:13 }}>
          {msg.text}
        </div>
      )}

      {/* Crear usuario */}
      <div className="card fade-in fade-in-1" style={{ padding:20, marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Nuevo usuario del sistema</h2>
        <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre completo" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@empresa.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Contrasena</label>
              <input className="form-input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimo 6 caracteres" />
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select className="form-input form-select" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </div>

      {/* Lista usuarios */}
      <div className="card fade-in fade-in-2" style={{ padding:20 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Usuarios del sistema</h2>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" style={{ width:28, height:28 }} /></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {users.map((u, i) => (
              <div key={u._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom: i < users.length-1 ? '1px solid var(--grey-100)' : 'none' }}>
                <div style={{ width:40, height:40, borderRadius:10, background: u.rol === 'admin' ? 'var(--red)' : 'var(--navy)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, flexShrink:0 }}>
                  {u.nombre?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{u.nombre}</p>
                    <span className={`badge ${u.rol === 'admin' ? 'badge-danger' : 'badge-info'}`} style={{ fontSize:10 }}>
                      {u.rol === 'admin' ? 'Admin' : 'Empleado'}
                    </span>
                    {u._id === user._id && <span className="badge badge-grey" style={{ fontSize:10 }}>Tu cuenta</span>}
                  </div>
                  <p style={{ fontSize:12, color:'var(--grey-500)' }}>{u.email}</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {u._id !== user._id && (
                    <>
                      <button className="btn btn-outline btn-sm" style={{ fontSize:11 }} onClick={() => toggleRole(u)}>
                        {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ fontSize:11 }} onClick={() => deleteUser(u)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferencias */}
      <div className="card fade-in fade-in-3" style={{ padding:20, marginTop:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:16 }}>Preferencias del Sistema</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group">
            <label className="form-label">Idioma</label>
            <select className="form-input form-select" defaultValue="es">
              <option value="es">Español (ES)</option>
              <option value="en">English (UK)</option>
              <option value="de">Deutsch (DE)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Moneda Principal</label>
            <select className="form-input form-select" defaultValue="eur">
              <option value="eur">Euro (€)</option>
              <option value="usd">Dólar ($)</option>
              <option value="gbp">Libra (£)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">IVA Defecto (%)</label>
            <input className="form-input" type="number" defaultValue="21" />
          </div>
          <div className="form-group">
            <label className="form-label">Formato de Fecha</label>
            <select className="form-input form-select" defaultValue="dd/mm/yyyy">
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
            </select>
          </div>
        </div>
        <button className="btn btn-navy btn-sm" style={{ marginTop:16 }}>Guardar preferencias</button>
      </div>

      {/* Info empresa */}
      <div className="card fade-in fade-in-4" style={{ padding:20, marginTop:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>Informacion del sistema</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            ['Aplicacion', 'BAEMIMPORT v2.0'],
            ['Base de datos', 'MongoDB Atlas'],
            ['Entorno', process.env.NODE_ENV || 'production'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--grey-100)', fontSize:13 }}>
              <span style={{ color:'var(--grey-500)', fontWeight:600 }}>{k}</span>
              <span style={{ color:'var(--navy)', fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
