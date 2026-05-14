
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApiEndpointConfig from '../components/ApiEndpointConfig';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
    const [form, setForm] = useState({ nombre:'', email:'', password:'', confirmar:'', rol:'cliente' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault(); setError('');
      if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden');
      if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(true);
      try {
        await axios.post('/api/auth/register', { 
          nombre: form.nombre, 
          email: form.email, 
          password: form.password,
          rol: form.rol 
        });
        await login(form.email, form.password);
        navigate('/');
      } catch (err) {
        if (!err.response) {
          setError('No se pudo conectar con el servidor. Revisa "Configurar servidor".');
        } else {
          setError(err.response?.data?.error || 'Error al registrarse');
        }
      }
      finally { setLoading(false); }
    };
  
    return (
      <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <svg width="52" height="52" viewBox="0 0 72 72" fill="none" style={{ display:'block', margin:'0 auto 12px' }}>
              <rect x="36" y="2" width="47" height="47" rx="4" transform="rotate(45 36 2)" fill="var(--red)" />
              <polygon points="26,36 44,24 44,48" fill="white" />
            </svg>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'white', letterSpacing:4 }}>BAEMIMPORT</h1>
          </div>
  
          <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'var(--navy)', marginBottom:6 }}>Crear cuenta</h2>
            <p style={{ fontSize:13, color:'var(--grey-500)', marginBottom:24 }}>Regístrate para acceder al sistema</p>
  
            {error && <div style={{ background:'#fff0f2', border:'1px solid #ffd0d7', color:'var(--red-dark)', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16 }}>{error}</div>}
  
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <button type="button" 
                  onClick={() => setForm(f => ({ ...f, rol:'cliente' }))}
                  className={`btn btn-full ${form.rol === 'cliente' ? 'btn-navy' : 'btn-outline'}`}
                  style={{ fontSize:11, padding:'8px 0' }}>Soy Cliente</button>
                <button type="button" 
                  onClick={() => setForm(f => ({ ...f, rol:'vendedor' }))}
                  className={`btn btn-full ${form.rol === 'vendedor' ? 'btn-navy' : 'btn-outline'}`}
                  style={{ fontSize:11, padding:'8px 0' }}>Soy Vendedor</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" required autoFocus value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="form-input" type="password" required minLength={6} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input className="form-input" type="password" required value={form.confirmar}
                  onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))} placeholder="Repite la contraseña" />
              </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:6 }}>
              {loading ? <span className="spinner" style={{ width:18, height:18, borderTopColor:'white' }} /> : 'Crear cuenta'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--grey-500)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color:'var(--red)', fontWeight:700 }}>Iniciar sesión</Link>
          </p>
          <ApiEndpointConfig />
        </div>
      </div>
    </div>
  );
}
