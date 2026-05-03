import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <svg width="52" height="52" viewBox="0 0 72 72" fill="none" style={{ display:'block', margin:'0 auto 12px' }}>
            <rect x="36" y="2" width="47" height="47" rx="4" transform="rotate(45 36 2)" fill="var(--red)" />
            <polygon points="26,36 44,24 44,48" fill="white" />
          </svg>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'white', letterSpacing:4 }}>BAEMIMPORT</h1>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', letterSpacing:2, marginTop:4, textTransform:'uppercase' }}>Importacion de Vehiculos</p>
        </div>

        <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--navy)', marginBottom:6 }}>Iniciar sesion</h2>
          <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>Accede al panel de gestion</p>

          {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required autoFocus value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Contrasena</label>
              <input className="form-input" type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Tu contrasena" />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'white' }} /> : 'Entrar'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--grey-500)' }}>
            Sin cuenta?{' '}
            <Link to="/register" style={{ color:'var(--red)', fontWeight:700 }}>Registrarse</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
