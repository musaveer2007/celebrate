import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot } from 'lucide-react';

function SidebarAI({ onAssist }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Design Assistant. I can help align, scale, or adjust lighting for your arrangements. How can I help today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');

    // Simulate AI thinking and acting
    setTimeout(() => {
      const response = onAssist(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  return (
    <aside className="sidebar glass-panel" style={{ width: '300px' }}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <Sparkles size={24} color="#6366f1" />
          AI Assistant
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Human-Controlled, AI-Assisted.
        </p>
      </div>

      <div className="sidebar-content ai-chat-container">
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#6366f1', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <Bot size={14} /> AI Copilot
                </div>
              )}
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="chat-input"
          placeholder="e.g. Make it symmetrical..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="chat-submit" disabled={!inputValue.trim()}>
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
}

export default SidebarAI;
