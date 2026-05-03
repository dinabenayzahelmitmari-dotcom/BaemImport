import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Inbox() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  const load = async () => {
    try {
      const r = await axios.get('/api/requests');
      setRequests(r.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, estado, requestData = null) => {
    await axios.put(`/api/requests/${id}`, { estado });
    setRequests(requests.map(r => r._id === id ? { ...r, estado } : r));
    
    if (estado === 'contactado' && requestData) {
      // Redirigir a crear vehiculo con los datos pre-rellenados
      navigate('/vehicles/new', { 
        state: { 
          marca: requestData.marca, 
          modelo: requestData.modelo,
          presupuesto: requestData.presupuesto
        } 
      });
    }
  };

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [contacts, setContacts] = useState([]);

  const loadContacts = async () => {
    try {
      const res = await axios.get('/api/chat/contacts/list');
      setContacts(res.data);
    } catch (err) { console.error(err); }
  };

  const loadMessages = async (userId) => {
    try {
      const res = await axios.get(`/api/chat/${userId}`);
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'chats') {
      loadContacts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedClient) {
      loadMessages(selectedClient._id);
      const interval = setInterval(() => loadMessages(selectedClient._id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedClient]);

  const startImport = async (requestId) => {
    try {
      const res = await axios.post(`/api/automation/convert/${requestId}`);
      navigate(`/orders/${res.data.orderId}`);
    } catch (err) { alert("Error al automatizar pedido"); }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedClient) return;
    try {
      await axios.post('/api/chat', { destinatario: selectedClient._id, texto: chatInput });
      setChatInput('');
      loadMessages(selectedClient._id);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>Buzón de Mensajes</h1>
        <p style={{ color: 'var(--grey-500)' }}>Gestiona las solicitudes y conversaciones de los clientes.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`btn ${activeTab === 'requests' ? 'btn-navy' : 'btn-outline'}`}
          style={{ flex: 1 }}>
          Solicitudes de Vehículos ({requests.length})
        </button>
        <button 
          onClick={() => { setActiveTab('chats'); setSelectedClient(null); }}
          className={`btn ${activeTab === 'chats' ? 'btn-navy' : 'btn-outline'}`}
          style={{ flex: 1 }}>
          Chats con Clientes
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
      ) : activeTab === 'requests' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--grey-400)' }}>No hay solicitudes pendientes</div>
          ) : (
            requests.map(req => (
              <div key={req._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge ${req.estado === 'pendiente' ? 'badge-warning' : 'badge-info'}`} style={{ marginBottom: 8 }}>
                      {req.estado.toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>
                      {req.marca} {req.modelo} ({req.anioDesde}+)
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--grey-500)', marginTop: 4 }}>
                      Cliente: <strong>{req.cliente?.nombre}</strong> ({req.cliente?.email})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--red)' }}>
                      {req.presupuesto?.toLocaleString()} €
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--grey-400)' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: 12, background: 'var(--grey-50)', borderRadius: 8, fontSize: 13, color: 'var(--grey-700)' }}>
                  <strong>Extras:</strong> {req.extras || 'Ninguno especificado'}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button className="btn btn-navy btn-sm" onClick={() => updateStatus(req._id, 'contactado', req)}>Solo Contactar</button>
                  <button className="btn btn-primary btn-sm" onClick={() => startImport(req._id)} style={{ background: '#2e7d32', borderColor: '#2e7d32' }}>Iniciar Importación</button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setActiveTab('chats'); setSelectedClient(req.cliente); }}>Abrir Chat</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, height: 600 }}>
          {/* Contact List */}
          <div className="card" style={{ padding: 0, overflowY: 'auto' }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--grey-100)', fontWeight: 700, color: 'var(--navy)' }}>Clientes</div>
            {contacts.map(c => (
              <div key={c._id} 
                   onClick={() => setSelectedClient(c)}
                   style={{ padding: 16, borderBottom: '1px solid var(--grey-50)', cursor: 'pointer', background: selectedClient?._id === c._id ? 'var(--grey-50)' : 'transparent' }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</p>
                <p style={{ fontSize: 11, color: 'var(--grey-500)' }}>{c.email}</p>
              </div>
            ))}
          </div>
          {/* Chat Window */}
          {selectedClient ? (
            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 16, borderBottom: '1px solid var(--grey-100)', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Chat con {selectedClient.nombre}</span>
              </div>
              <div style={{ flex: 1, padding: 20, background: 'var(--grey-50)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                {messages.map(m => (
                  <div key={m._id} style={{ 
                    alignSelf: m.remitente === selectedClient._id ? 'flex-start' : 'flex-end', 
                    background: m.remitente === selectedClient._id ? 'white' : 'var(--navy)', 
                    color: m.remitente === selectedClient._id ? 'var(--navy)' : 'white',
                    padding: '10px 14px', 
                    borderRadius: m.remitente === selectedClient._id ? '12px 12px 12px 2px' : '12px 12px 2px 12px', 
                    fontSize: 13, maxWidth: '80%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                  }}>
                    {m.texto}
                  </div>
                ))}
              </div>
              <form onSubmit={sendMsg} style={{ padding: 16, borderTop: '1px solid var(--grey-100)', display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Escribe un mensaje..." style={{ flex: 1 }} value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button className="btn btn-navy" type="submit">Enviar</button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--grey-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Selecciona un cliente para ver la conversación
            </div>
          )}
        </div>
      )}
    </div>
  );
}
