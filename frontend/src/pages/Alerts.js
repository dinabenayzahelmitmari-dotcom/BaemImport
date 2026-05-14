
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Alerts.css';

const TIPO_CONFIG = {
  urgente: { color: '#c8102e', bg: '#fff0f2', label: 'Urgente' },
  error:   { color: '#c8102e', bg: '#fff0f2', label: 'Atención' },
  aviso:   { color: '#f57f17', bg: '#fff8e1', label: 'Aviso' },
  info:    { color: '#1565c0', bg: '#e3f2fd', label: 'Información' },
};

export default function Alerts() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/alerts')
      .then(res => setAlertas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header fade-in">
        <div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-subtitle">{alertas.length} activas</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setLoading(true); axios.get('/api/alerts').then(r => setAlertas(r.data)).finally(() => setLoading(false)); }}>
          <RefreshIcon /> Actualizar
        </button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
          <div className="spinner" style={{ width:32, height:32 }} />
        </div>
      ) : alertas.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>Todo en orden</h3>
          <p>No hay alertas activas en este momento</p>
        </div>
      ) : (
        <div className="alerts-list fade-in fade-in-1">
          {alertas.map((a, i) => {
            const cfg = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.info;
            return (
              <div
                key={i}
                className="alert-card card card-pressable"
                style={{ borderLeft: `4px solid ${cfg.color}` }}
                onClick={() => {
                  if (a.pedidoId) navigate(`/orders/${a.pedidoId}`);
                  else if (a.vehiculoId) navigate(`/vehicles/${a.vehiculoId}`);
                }}
              >
                <div className="alert-top">
                  <span className="alert-tipo-badge" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {(a.pedidoId || a.vehiculoId) && <ChevronIcon />}
                </div>
                <h3 className="alert-title">{a.titulo}</h3>
                <p className="alert-msg">{a.mensaje}</p>
                {(a.pedidoId || a.vehiculoId) && (
                  <p className="alert-action">
                    {a.pedidoId ? 'Ver pedido' : 'Ver vehículo'} →
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="alerts-info fade-in">
        <InfoIcon />
        <p>Las alertas se actualizan automáticamente. Incluyen entregas próximas, presupuestos parados y vehículos sin actividad.</p>
      </div>
    </div>
  );
}

function ChevronIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function InfoIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function RefreshIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
