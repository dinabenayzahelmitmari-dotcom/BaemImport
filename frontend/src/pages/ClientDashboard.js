import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('request');
  const [formData, setFormData] = useState({
    marca: '', modelo: '', anioDesde: '', presupuesto: '', combustible: 'Diesel', transmision: 'Automatico', extras: ''
  });
  const [msg, setMsg] = useState({ text: '', ok: false });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: 'Enviando solicitud...', ok: true });
    try {
      await axios.post('/api/requests', formData);
      setMsg({ text: 'Tu solicitud ha sido enviada con éxito. Un vendedor te contactará pronto.', ok: true });
      setFormData({ marca: '', modelo: '', anioDesde: '', presupuesto: '', combustible: 'Diesel', transmision: 'Automatico', extras: '' });
    } catch (err) {
      setMsg({ text: 'Error al enviar la solicitud: ' + (err.response?.data?.error || err.message), ok: false });
    }
  };

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [vendor, setVendor] = useState(null);

  const loadChat = async () => {
    try {
      // Primero buscar un vendedor con quien hablar
      const contactsRes = await axios.get('/api/chat/contacts/list');
      if (contactsRes.data.length > 0) {
        const v = contactsRes.data[0];
        setVendor(v);
        const msgRes = await axios.get(`/api/chat/${v._id}`);
        setMessages(msgRes.data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      loadChat();
      const interval = setInterval(loadChat, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const [sending, setSending] = useState(false);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !vendor || sending) return;
    setSending(true);
    try {
      await axios.post('/api/chat', { destinatario: vendor._id, texto: chatInput });
      setChatInput('');
      loadChat();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>Panel de Cliente</h1>
        <p style={{ color: 'var(--grey-500)' }}>Gestiona tus solicitudes de importación y habla con nosotros.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => setActiveTab('request')}
          className={`btn ${activeTab === 'request' ? 'btn-navy' : 'btn-outline'}`}
          style={{ flex: 1 }}>
          1. Solicitar Vehículo
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`btn ${activeTab === 'chat' ? 'btn-navy' : 'btn-outline'}`}
          style={{ flex: 1 }}>
          2. Chat con Vendedor
        </button>
      </div>

      {msg.text && (
        <div className="card" style={{ padding: 16, marginBottom: 20, background: msg.ok ? '#e8f5e9' : '#fff0f2', color: msg.ok ? '#2e7d32' : 'var(--red)' }}>
          {msg.text}
        </div>
      )}

      {activeTab === 'request' ? (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--navy)' }}>Cuéntanos qué coche buscas</h2>
          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-input" required value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} placeholder="Ej: BMW" />
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="form-input" required value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} placeholder="Ej: Serie 3" />
            </div>
            <div className="form-group">
              <label className="form-label">Año mínimo</label>
              <input className="form-input" type="number" required value={formData.anioDesde} onChange={e => setFormData({...formData, anioDesde: e.target.value})} placeholder="Ej: 2020" />
            </div>
            <div className="form-group">
              <label className="form-label">Presupuesto máx (€)</label>
              <input className="form-input" type="number" required value={formData.presupuesto} onChange={e => setFormData({...formData, presupuesto: e.target.value})} placeholder="Ej: 35000" />
            </div>
            <div className="form-group">
              <label className="form-label">Combustible</label>
              <select className="form-input" value={formData.combustible} onChange={e => setFormData({...formData, combustible: e.target.value})}>
                <option>Diesel</option>
                <option>Gasolina</option>
                <option>Hibrido</option>
                <option>Electrico</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transmisión</label>
              <select className="form-input" value={formData.transmision} onChange={e => setFormData({...formData, transmision: e.target.value})}>
                <option>Automatico</option>
                <option>Manual</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Extras y Comentarios</label>
              <textarea className="form-input" rows="4" value={formData.extras} onChange={e => setFormData({...formData, extras: e.target.value})} placeholder="Ej: Techo solar, Pack M, color negro..." />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: 10 }}>
              <button className="btn btn-primary btn-full" type="submit">Enviar mi solicitud</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, height: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, background: 'var(--navy)', color: 'white', fontWeight: 700, borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Chat con {vendor?.nombre || 'Asesor'}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>EN LÍNEA</span>
          </div>
          <div style={{ flex: 1, padding: 20, background: 'var(--grey-50)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--grey-400)', fontSize: 13 }}>Inicia una conversación con nosotros...</div>
            )}
            {messages.map(m => (
              <div key={m._id} style={{ 
                alignSelf: m.remitente === vendor?._id ? 'flex-start' : 'flex-end', 
                background: m.remitente === vendor?._id ? 'white' : 'var(--red)', 
                color: m.remitente === vendor?._id ? 'var(--navy)' : 'white',
                padding: '10px 14px', 
                borderRadius: m.remitente === vendor?._id ? '12px 12px 12px 2px' : '12px 12px 2px 12px', 
                fontSize: 13, 
                maxWidth: '80%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
              }}>
                {m.texto}
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMsg} style={{ padding: 16, borderTop: '1px solid var(--grey-100)', display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Escribe un mensaje..." style={{ flex: 1 }} value={chatInput} onChange={e => setChatInput(e.target.value)} />
            <button className="btn btn-navy" type="submit" disabled={sending || !vendor}>
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
