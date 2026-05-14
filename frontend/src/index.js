
import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import { getConfiguredApiBaseUrl } from './utils/apiBaseUrl';

// Configura el endpoint de API antes de montar React (web y móvil).
const baseUrl = getConfiguredApiBaseUrl();
if (baseUrl) axios.defaults.baseURL = baseUrl;

// Crea la raiz de React sobre el contenedor principal del HTML.
const root = ReactDOM.createRoot(document.getElementById('root'));
// Monta la aplicacion completa en el navegador.
root.render(<App />);
