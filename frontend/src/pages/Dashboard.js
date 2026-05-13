
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const ESTADOS_PEDIDO = { presupuesto:'badge-grey', confirmado:'badge-info', en_gestion:'badge-warning', completado:'badge-success', cancelado:'badge-danger' };
const ESTADOS_LABEL  = { presupuesto:'Presupuesto', confirmado:'Confirmado', en_gestion:'En gestión', completado:'Completado', cancelado:'Cancelado' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/stats/dashboard'),
      axios.get('/api/alerts'),
    ])
      .then(([s, a]) => {
        setStats(s.data);
        setAlertas(a.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const QUICK = [
    { label: 'Nuevo vehículo',    path: '/vehicles/new',  color: 'var(--red)',     icon: PlusCarIcon },
    { label: 'Nuevo Cliente',     path: '/clients/new',   color: 'var(--navy)',    icon: PlusUserIcon },
    { label: 'Nuevo Pedido',      path: '/orders/new',    color: '#2e7d32',        icon: PlusBoxIcon },
    { label: 'Presupuesto',       path: '/quotes/new',    color: '#1565c0',        icon: DocIcon },
    { label: 'Calculadora',       path: '/calculator',    color: '#f57f17',        icon: CalcIcon },
    { label: 'Alertas',           path: '/alerts',        color: '#7b1fa2',        icon: BellIcon },
  ];

  if (loading) return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}>
        <div className="spinner" style={{ width:36, height:36 }} />
      </div>
    </div>
  );

  const hora = new Date().getHours();
  const saludo = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="page">
      {/* Greeting */}
      <div className="dash-greeting fade-in">
        <p className="dash-saludo">{saludo},</p>
        <h1 className="dash-nombre">{user?.nombre}</h1>
        <div className="dash-red-bar" />
      </div>

      {/* KPIs */}
      <div className="dash-section fade-in fade-in-1">
        <p className="dash-section-title">Resumen del negocio</p>
        <div className="dash-kpis">
          <div className="dash-kpi dash-kpi-highlight" style={{ borderLeft: '4px solid var(--navy)' }}>
            <p className="dash-kpi-label">Coches en Origen (GER)</p>
            <p className="dash-kpi-value">12</p>
            <p className="dash-kpi-sub" style={{ color: '#2e7d32' }}>↑ 2 esta semana</p>
          </div>
          <div className="dash-kpi" style={{ borderLeft: '4px solid var(--red)' }}>
            <p className="dash-kpi-label">Trámites ITV/DGT (ESP)</p>
            <p className="dash-kpi-value">8</p>
            <p className="dash-kpi-sub">Procesando citas...</p>
          </div>
          <div className="dash-kpi" style={{ borderLeft: '4px solid #fbc02d' }}>
            <p className="dash-kpi-label">ROI Medio Import.</p>
            <p className="dash-kpi-value">18.4%</p>
            <p className="dash-kpi-sub" style={{ color: '#2e7d32' }}>+2.1% vs mes anterior</p>
          </div>
          <div className="dash-kpi" style={{ borderLeft: '4px solid #4fc3f7' }}>
            <p className="dash-kpi-label">Modelo Tendencia</p>
            <p className="dash-kpi-value" style={{ fontSize: '18px' }}>BMW M4 (G82)</p>
            <p className="dash-kpi-sub">Alta demanda en España</p>
          </div>
        </div>
      </div>

      {/* Estado vehiculos */}
      <div className="dash-section fade-in fade-in-2">
        <p className="dash-section-title">Estado del stock</p>
        <div className="dash-stock-row">
          {[
            { label: 'Disponibles', val: stats?.vehiculos?.disponibles || 0, color: '#2e7d32', bg: '#e8f5e9' },
            { label: 'Reservados',  val: stats?.vehiculos?.reservados  || 0, color: '#f57f17', bg: '#fff8e1' },
            { label: 'En tránsito', val: stats?.vehiculos?.en_transito || 0, color: '#1565c0', bg: '#e3f2fd' },
            { label: 'Vendidos',    val: stats?.vehiculos?.vendidos    || 0, color: '#c8102e', bg: '#fff0f2' },
          ].map(s => (
            <div key={s.label} className="dash-stock-item" style={{ background: s.bg }}>
              <p className="dash-stock-val" style={{ color: s.color }}>{s.val}</p>
              <p className="dash-stock-label" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="dash-section fade-in fade-in-2">
        <p className="dash-section-title">Acciones rápidas</p>
        <div className="dash-quick-actions">
          {QUICK.map(q => (
            <button key={q.path} className="dash-action-btn" onClick={() => navigate(q.path)}>
              <div className="dash-action-icon" style={{ background: q.color + '18', color: q.color }}>
                <q.icon />
              </div>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas activas */}
      {alertas.length > 0 && (
        <div className="dash-section fade-in fade-in-3">
          <div className="dash-section-header">
            <p className="dash-section-title">Alertas activas</p>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>Ver todas</button>
          </div>
          <div className="dash-alerts">
            {alertas.map((a, i) => {
              const colores = { urgente:'#c8102e', error:'#c8102e', aviso:'#f57f17', info:'#1565c0' };
              const bgs     = { urgente:'#fff0f2', error:'#fff0f2', aviso:'#fff8e1', info:'#e3f2fd' };
              return (
                <div key={i} className="dash-alert-item" style={{ background: bgs[a.tipo], borderLeftColor: colores[a.tipo] }}
                  onClick={() => a.pedidoId ? navigate(`/orders/${a.pedidoId}`) : navigate('/alerts')}>
                  <div>
                    <p className="dash-alert-title" style={{ color: colores[a.tipo] }}>{a.titulo}</p>
                    <p className="dash-alert-msg">{a.mensaje}</p>
                  </div>
                  <ChevronIcon />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ultimos pedidos */}
      {stats?.ultimosPedidos?.length > 0 && (
        <div className="dash-section fade-in fade-in-4">
          <div className="dash-section-header">
            <p className="dash-section-title">Ultimos pedidos</p>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>Ver todos</button>
          </div>
          <div className="dash-orders-list">
            {stats.ultimosPedidos.map(o => (
              <div key={o._id} className="card card-pressable dash-order-card" onClick={() => navigate(`/orders/${o._id}`)}>
                <div className="dash-order-info">
                  <p className="dash-order-title">{o.vehiculo?.marca} {o.vehiculo?.modelo}</p>
                  <p className="dash-order-client">{o.cliente?.nombre} {o.cliente?.apellidos || ''}</p>
                </div>
                <div className="dash-order-right">
                  <span className={`badge ${ESTADOS_PEDIDO[o.estado]}`}>{ESTADOS_LABEL[o.estado]}</span>
                  <p className="dash-order-price">{o.precioFinal?.toLocaleString('es-ES')} €</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currency Converter (Extra) */}
      <div className="dash-section fade-in fade-in-4" style={{ marginBottom: 80 }}>
        <p className="dash-section-title">Utilidades de importación</p>
        <div className="card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--navy)' }}>Conversor de Moneda</h3>
            <p style={{ fontSize: '12px', color: 'var(--grey-500)', marginBottom: '12px' }}>Tipos de cambio orientativos para negociaciones internacionales.</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--grey-400)', display: 'block', marginBottom: '4px' }}>USD</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="form-input" placeholder="1.00" defaultValue="1" style={{ paddingRight: '30px' }} />
                  <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: 'var(--grey-400)' }}>$</span>
                </div>
              </div>
              <div style={{ marginTop: '18px', color: 'var(--grey-300)' }}>→</div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--grey-400)', display: 'block', marginBottom: '4px' }}>EUR</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" className="form-input" value="0.92" readOnly style={{ background: 'var(--grey-50)', paddingRight: '30px' }} />
                  <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '12px', color: 'var(--grey-400)' }}>€</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--grey-100)', paddingLeft: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--navy)' }}>Notas de Mercado</h3>
            <ul style={{ fontSize: '12px', color: 'var(--grey-700)', paddingLeft: '16px', lineHeight: '1.6' }}>
              <li>Tendencia al alza en vehículos eléctricos en Alemania.</li>
              <li>Nuevos aranceles previstos para importaciones fuera de la UE.</li>
              <li>Aumento de disponibilidad en marcas premium de ocasión.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusCarIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; }
function PlusUserIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="9" y1="17" x2="15" y2="17"/></svg>; }
function PlusBoxIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="8" y1="7" x2="12" y2="5"/></svg>; }
function DocIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function CalcIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/></svg>; }
function BellIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>; }
function ChevronIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
