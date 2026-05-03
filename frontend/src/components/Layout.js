import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AIChat from './AIChat';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/',          label: 'Inicio',        icon: HomeIcon },
  { path: '/vehicles',  label: 'Vehiculos',     icon: CarIcon },
  { path: '/clients',   label: 'Clientes',      icon: UsersIcon },
  { path: '/orders',    label: 'Pedidos',        icon: BoxIcon },
  { path: '/quotes',    label: 'Presupuestos',  icon: FileTextIcon },
];

const SIDEBAR_ITEMS = [
  { path: '/',            label: 'Dashboard',    icon: HomeIcon },
  { path: '/vehicles',    label: 'Vehiculos',    icon: CarIcon },
  { path: '/clients',     label: 'Clientes',     icon: UsersIcon },
  { path: '/orders',      label: 'Pedidos',       icon: BoxIcon },
  { path: '/quotes',      label: 'Presupuestos', icon: FileTextIcon },
  { path: '/invoices',    label: 'Facturas',     icon: ReceiptIcon },
  { path: '/tasks',       label: 'Tareas',       icon: CheckSquareIcon },
  { path: '/calculator',  label: 'Calculadora',  icon: CalcIcon },
  { path: '/inbox',       label: 'Buzón',        icon: MessageIcon },
  { path: '/market-insights', label: 'Mercado', icon: ChartIcon },
  { path: '/alerts',      label: 'Alertas',      icon: BellIcon },
  { path: '/settings',    label: 'Ajustes',      icon: SettingsIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.rol === 'cliente' && location.pathname === '/') {
      navigate('/client-dashboard');
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 60000);
    return () => clearInterval(interval);
  }, [user, location]);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifs = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifCount(res.data.noLeidas || 0);
      setNotifs(res.data.notifications || []);
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Sidebar desktop */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="32" height="32" viewBox="0 0 72 72" fill="none">
              <rect x="36" y="2" width="47" height="47" rx="3" transform="rotate(45 36 2)" fill="#0d1b2e" />
              <polygon points="26,36 44,24 44,48" fill="#c8102e" />
            </svg>
            <span className="sidebar-brand">BAEMIMPORT</span>
          </div>
          <button className="sidebar-close btn btn-ghost btn-sm" onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {user?.rol === 'cliente' ? (
            <Link to="/client-dashboard" className={`sidebar-item ${isActive('/client-dashboard') ? 'active' : ''}`}>
              <HomeIcon />
              <span>Panel de Cliente</span>
            </Link>
          ) : (
            SIDEBAR_ITEMS.map(item => {
              if (item.path === '/settings' && user?.rol !== 'admin') return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.path === '/alerts' && notifCount > 0 && (
                    <span className="sidebar-badge">{notifCount}</span>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.nombre?.[0]?.toUpperCase()}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.nombre}</p>
              <p className="sidebar-user-role">{user?.rol === 'admin' ? 'Administrador' : 'Empleado'}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm sidebar-logout" onClick={handleLogout} title="Cerrar sesion">
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="main-wrapper">
        {/* Top bar */}
        <header className="topbar">
          <button className="topbar-menu btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </button>
          <div className="topbar-logo">
            <svg width="24" height="24" viewBox="0 0 72 72" fill="none">
              <rect x="36" y="2" width="47" height="47" rx="3" transform="rotate(45 36 2)" fill="#0d1b2e" />
              <polygon points="26,36 44,24 44,48" fill="#c8102e" />
            </svg>
            <span className="topbar-brand">BAEMIMPORT</span>
          </div>

          <div className="topbar-actions">
            {/* Notificaciones */}
            <div className="notif-wrap" ref={notifRef}>
              <button className="topbar-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <BellIcon />
                {notifCount > 0 && <span className="topbar-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notificaciones</span>
                    {notifCount > 0 && (
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={async () => {
                        await axios.put('/api/notifications/leer-todas');
                        loadNotifs();
                      }}>Marcar todas</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifs.length === 0 ? (
                      <p className="notif-empty">Sin notificaciones</p>
                    ) : notifs.slice(0, 8).map(n => (
                      <div key={n._id} className={`notif-item ${!n.leida ? 'unread' : ''}`} onClick={async () => {
                        await axios.put(`/api/notifications/${n._id}/leer`);
                        loadNotifs();
                        if (n.enlace) navigate(n.enlace);
                        setNotifOpen(false);
                      }}>
                        <div className={`notif-dot tipo-${n.tipo}`} />
                        <div>
                          <p className="notif-title">{n.titulo}</p>
                          <p className="notif-msg">{n.mensaje}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="topbar-user">
              <div className="topbar-avatar">{user?.nombre?.[0]?.toUpperCase()}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <div className="page-inner">
            <Outlet />
          </div>
        </main>

        {/* Bottom nav mobile */}
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      {/* AI Assistant */}
      <AIChat />
      </div>
    </div>
  );
}

// SVG Icons
function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function CarIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; }
function UsersIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function BoxIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function FileTextIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function ReceiptIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2l-3 2-2-2-2 2-2-2-2 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>; }
function CheckSquareIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
function MessageIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>; }
function CalcIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/></svg>; }
function ChartIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function BellIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>; }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function CloseIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function LogoutIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
