
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ESTADO_BADGE = {
  disponible: 'badge-success',
  reservado: 'badge-warning',
  en_transito: 'badge-info',
  vendido: 'badge-danger',
};

const ESTADO_LABEL = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  en_transito: 'En tránsito',
  vendido: 'Vendido',
};

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const params = useMemo(() => {
    const q = [];
    if (filtroEstado) q.push(`estado=${encodeURIComponent(filtroEstado)}`);
    if (search) q.push(`search=${encodeURIComponent(search)}`);
    return q.length ? `?${q.join('&')}` : '';
  }, [filtroEstado, search]);

  const load = () => {
    setLoading(true);
    axios.get(`/api/vehicles${params}`)
      .then(r => setVehicles(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [params]);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Vehículos</h1>
          <p className="page-subtitle">{vehicles.length} en inventario</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/vehicles/new')}>+ Nuevo</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }} className="fade-in fade-in-1">
        {[
          ['', 'Todos'],
          ['disponible', 'Disponible'],
          ['reservado', 'Reservado'],
          ['en_transito', 'En tránsito'],
          ['vendido', 'Vendido'],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`btn btn-sm ${filtroEstado === v ? 'btn-navy' : 'btn-outline'}`}
            style={{ fontSize: 12 }}
            onClick={() => setFiltroEstado(v)}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }} className="fade-in fade-in-2">
        <input
          className="form-input"
          placeholder="Buscar por marca, modelo o VIN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state">
          <h3>Sin vehículos</h3>
          <p>No hay vehículos con el filtro seleccionado</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/vehicles/new')}>Nuevo vehículo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vehicles.map((v, i) => (
            <div
              key={v._id}
              className={`card card-pressable fade-in fade-in-${Math.min(i + 1, 4)}`}
              style={{ padding: '14px 16px' }}
              onClick={() => navigate(`/vehicles/${v._id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span className={`badge ${ESTADO_BADGE[v.estado] || 'badge-grey'}`}>{ESTADO_LABEL[v.estado] || v.estado}</span>
                    <span style={{ fontSize: 11, color: 'var(--grey-500)' }}>
                      {v.ubicacion || '—'}{v.combustible ? ` · ${v.combustible}` : ''}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>
                    {v.marca} {v.modelo} {v.anio}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 2 }}>
                    {v.vin ? `VIN: ${v.vin}` : 'VIN: —'}
                    {typeof v.kilometros === 'number' ? ` · ${v.kilometros.toLocaleString('es-ES')} km` : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>
                    {v.precio?.toLocaleString('es-ES')} EUR
                  </p>
                  {typeof v.margen === 'number' && (
                    <p style={{ fontSize: 11, color: v.margen >= 0 ? 'var(--grey-500)' : 'var(--red)' }}>
                      Margen: {v.margen.toLocaleString('es-ES')} EUR
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

