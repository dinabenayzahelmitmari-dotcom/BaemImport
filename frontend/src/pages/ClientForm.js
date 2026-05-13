
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState({ nombre:'', apellidos:'', email:'', telefono:'', dni:'', direccion:'', ciudad:'', notas:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sendWelcome, setSendWelcome] = useState(true);

  useEffect(() => {
    if (editing) {
      axios.get(`/api/clients/${id}`).then(r => {
        const { nombre, apellidos, email, telefono, dni, direccion, ciudad, notas } = r.data;
        setForm({ nombre, apellidos: apellidos||'', email: email||'', telefono: telefono||'', dni: dni||'', direccion: direccion||'', ciudad: ciudad||'', notas: notas||'' });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (editing) {
        await axios.put(`/api/clients/${id}`, form);
      } else {
        const res = await axios.post('/api/clients', form);
        if (sendWelcome && form.email) {
          try { await axios.post(`/api/email/bienvenida/${res.data._id}`); } catch {}
        }
      }
      navigate(editing ? `/clients/${id}` : '/clients');
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar'); }
    finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(x => ({ ...x, [k]: e.target.value })) });

  return (
    <div className="page">
      <div className="detail-header fade-in">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(editing ? `/clients/${id}` : '/clients')}>
          <BackIcon /> {editing ? 'Cancelar' : 'Clientes'}
        </button>
      </div>

      <div className="card fade-in fade-in-1" style={{ padding:24, marginTop:8 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:4 }}>
          {editing ? 'Editar cliente' : 'Nuevo cliente'}
        </h1>
        <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>
          {editing ? 'Actualiza los datos del cliente' : 'Completa el formulario para registrar un nuevo cliente'}
        </p>

        {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" required {...f('nombre')} placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <input className="form-input" {...f('apellidos')} placeholder="Apellidos" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" {...f('email')} placeholder="cliente@ejemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Telefono</label>
              <input className="form-input" {...f('telefono')} placeholder="+34 600 000 000" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">DNI / NIE / CIF</label>
              <input className="form-input" {...f('dni')} placeholder="12345678A" />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input className="form-input" {...f('ciudad')} placeholder="Madrid" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Direccion</label>
            <input className="form-input" {...f('direccion')} placeholder="Calle, numero, piso..." />
          </div>
          <div className="form-group">
            <label className="form-label">Notas internas</label>
            <textarea className="form-input" {...f('notas')} placeholder="Preferencias, historial, observaciones..." rows={3} />
          </div>
          {!editing && (
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" checked={sendWelcome} onChange={e => setSendWelcome(e.target.checked)} />
              <span style={{ fontSize:13, color:'var(--grey-700)' }}>Enviar email de bienvenida al cliente</span>
            </label>
          )}
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'white' }} /> : (editing ? 'Guardar cambios' : 'Registrar cliente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BackIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
