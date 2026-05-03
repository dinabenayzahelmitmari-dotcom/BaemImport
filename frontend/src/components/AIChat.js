import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AIChat.css';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de BAEMIMPORT. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/communication/ai/ask', { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ha ocurrido un error al procesar tu consulta.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="ai-chat-window fade-in">
          <div className="ai-chat-header">
            <span>Asistente Inteligente</span>
            <button onClick={() => setIsOpen(false)} className="close-btn">&times;</button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && <div className="message assistant loading">...</div>}
            <div ref={chatEndRef} />
          </div>
          <form className="ai-chat-input" onSubmit={handleSend}>
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Escribe tu duda aquí..."
            />
            <button type="submit" disabled={loading}>Enviar</button>
          </form>
        </div>
      )}
      <button className="ai-chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
  );
}
