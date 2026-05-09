import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    axios.get(`/api/clients${params}`)
      .then(r => setClients(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div><h1 className="page-title">Clientes</h1><p className="page-subtitle">{clients.length} registrados</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/clients/new')}>+ Nuevo</button>
        </div>
      </div>
      <div style={{ marginBottom:16 }} className="fade-in fade-in-1">
        <input className="form-input" placeholder="Buscar por nombre, email, teléfono..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : clients.length === 0 ? (
        <div className="empty-state"><h3>Sin clientes</h3><p>No se encontraron clientes</p><button className="btn btn-primary btn-sm" onClick={() => navigate('/clients/new')}>Nuevo cliente</button></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {clients.map((c, i) => (
            <div key={c._id} className={`card card-pressable fade-in fade-in-${Math.min(i+1,4)}`} style={{ padding:'14px 16px' }} onClick={() => navigate(`/clients/${c._id}`)}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'var(--navy)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, flexShrink:0 }}>
                  {c.nombre?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--navy)' }}>{c.nombre} {c.apellidos || ''}</p>
                  <p style={{ fontSize:13, color:'var(--grey-500)', marginTop:2 }}>{[c.telefono, c.email].filter(Boolean).join(' · ')}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
