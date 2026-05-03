import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ESTADO_BADGE = { disponible:'badge-success', reservado:'badge-warning', vendido:'badge-danger', en_transito:'badge-info' };
const ESTADO_LABEL = { disponible:'Disponible', reservado:'Reservado', vendido:'Vendido', en_transito:'En transito' };

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtros, setFiltros]   = useState({ estado:'', combustible:'', ubicacion:'', search:'' });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    axios.get(`/api/vehicles?${params}`)
      .then(r => setVehicles(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filtros]);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Vehiculos</h1>
          <p className="page-subtitle">{vehicles.length} en cartera</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/vehicles/new')}>
            <PlusIcon /> Anadir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card fade-in fade-in-1" style={{ padding:'14px 16px', marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <input className="form-input" style={{ fontSize:13 }} placeholder="Buscar marca, modelo, VIN..." value={filtros.search}
            onChange={e => setFiltros(f => ({ ...f, search: e.target.value }))} />
          <select className="form-input form-select" style={{ fontSize:13 }} value={filtros.estado}
            onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}>
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="en_transito">En transito</option>
            <option value="vendido">Vendido</option>
          </select>
          <select className="form-input form-select" style={{ fontSize:13 }} value={filtros.combustible}
            onChange={e => setFiltros(f => ({ ...f, combustible: e.target.value }))}>
            <option value="">Cualquier combustible</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Diesel">Diesel</option>
            <option value="Hibrido">Hibrido</option>
            <option value="Electrico">Electrico</option>
            <option value="GLP">GLP</option>
          </select>
          <select className="form-input form-select" style={{ fontSize:13 }} value={filtros.ubicacion}
            onChange={e => setFiltros(f => ({ ...f, ubicacion: e.target.value }))}>
            <option value="">Cualquier ubicacion</option>
            <option value="Alemania">Alemania</option>
            <option value="En transito">En transito</option>
            <option value="Espana">Espana</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div className="spinner" style={{ width:32, height:32 }} />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon" style={{ fontSize:48, opacity:0.3 }}>
            <CarIcon />
          </div>
          <h3>Sin vehiculos</h3>
          <p>No se encontraron vehiculos con los filtros actuales</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/vehicles/new')}>Anadir vehiculo</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {vehicles.map((v, i) => (
            <div key={v._id} className={`card card-pressable fade-in fade-in-${Math.min(i+1,4)}`}
              style={{ padding:'14px 16px' }} onClick={() => navigate(`/vehicles/${v._id}`)}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span className={`badge ${ESTADO_BADGE[v.estado] || 'badge-grey'}`}>{ESTADO_LABEL[v.estado] || v.estado}</span>
                    <span style={{ fontSize:12, color:'var(--grey-500)' }}>{v.ubicacion}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--navy)', marginBottom:2 }}>
                    {v.marca} {v.modelo}
                  </h3>
                  <p style={{ fontSize:13, color:'var(--grey-500)' }}>
                    {v.anio} · {v.combustible} · {v.transmision} · {v.kilometros?.toLocaleString('es-ES')} km
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--navy)' }}>
                    {v.precio?.toLocaleString('es-ES')} €
                  </p>
                  {v.precioCompra && (
                    <p style={{ fontSize:11, color:'var(--grey-500)' }}>
                      Compra: {v.precioCompra.toLocaleString('es-ES')} €
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CarIcon()  { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; }
