
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import VehicleForm from './pages/VehicleForm';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderForm from './pages/OrderForm';
import Quotes from './pages/Quotes';
import QuoteForm from './pages/QuoteForm';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import Tasks from './pages/Tasks';
import Calculator from './pages/Calculator';
import ClientDashboard from './pages/ClientDashboard';
import Inbox from './pages/Inbox';
import MarketInsights from './pages/MarketInsights';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  // Mientras se comprueba el token (AuthProvider), mostramos un estado de carga.
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );
  // Si no hay sesion, redirige a /login. Si la hay, permite renderizar el contenido protegido.
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  // Guard simple por rol para pantallas de administracion.
  if (!user || user.rol !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    // AuthProvider mantiene la sesion y Router gestiona navegacion SPA.
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas: Layout define el marco comun (nav, header, etc.) */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            {/* Vehiculos */}
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="vehicles/new" element={<VehicleForm />} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route path="vehicles/:id/edit" element={<VehicleForm />} />
            {/* Clientes */}
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="clients/:id/edit" element={<ClientForm />} />
            {/* Pedidos */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/edit" element={<OrderForm />} />
            {/* Presupuestos */}
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/new" element={<QuoteForm />} />
            <Route path="quotes/:id/edit" element={<QuoteForm />} />
            {/* Facturas */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="invoices/:id/edit" element={<InvoiceForm />} />
            {/* Tareas */}
            <Route path="tasks" element={<Tasks />} />
            {/* Herramientas */}
            <Route path="calculator" element={<Calculator />} />
            <Route path="client-dashboard" element={<ClientDashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="market-insights" element={<MarketInsights />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            {/* Configuracion */}
            <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
