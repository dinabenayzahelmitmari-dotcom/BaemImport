
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// En Android/iOS nativo no existe proxy de CRA: define URL real del backend.
const isNativeCapacitor = !!window?.Capacitor?.isNativePlatform?.();
if (isNativeCapacitor) {
  const isAndroid = window?.Capacitor?.getPlatform?.() === "android";
  const fallbackBaseUrl = isAndroid ? "http://10.0.2.2:8080" : "http://localhost:8080";
  axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || fallbackBaseUrl;
}

// Crea la raiz de React sobre el contenedor principal del HTML.
const root = ReactDOM.createRoot(document.getElementById('root'));
// Monta la aplicacion completa en el navegador.
root.render(<App />);
