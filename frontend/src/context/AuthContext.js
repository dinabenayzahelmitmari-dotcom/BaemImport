
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Contexto para compartir sesion (usuario y acciones) en todo el arbol de React.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado de sesion y flag para no renderizar rutas privadas antes de comprobar el token.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al arrancar: recupera el token persistido y valida la sesion con /api/auth/me.
    const token = localStorage.getItem('baem_token');
    if (token) {
      // Fija el header por defecto para todas las peticiones axios.
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Si el token no vale, limpia storage y el header para volver a estado anonimo.
          localStorage.removeItem('baem_token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Login: intercambia credenciales por { token, user }, persiste y deja axios listo.
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('baem_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    // Logout: elimina token persistido, limpia header y estado en memoria.
    localStorage.removeItem('baem_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    // Expone sesion + acciones a cualquier componente via useAuth().
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Hook ergonomico para consumir el contexto sin repetir useContext(AuthContext).
  return useContext(AuthContext);
}
