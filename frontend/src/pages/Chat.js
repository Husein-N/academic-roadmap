import API_URL from '../config';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  "What does my roadmap say?",
  "Why was I recommended this direction?",
  "What are my strongest interests?",
  "What subjects should I focus on?",
  "What careers match my personality?",
  "How do I prepare for entrance exams?",
];

export default function Chat() {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const storageKey = `chat_history_${user.user_id}`;
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return [{
      role: 'assistant',
      content: `Hi ${user.full_name?.split(' ')[0]} 👋 I'm your AI Academic Advisor!\n\nI have full access to your assessment results and roadmap, so I can give you deeply personalized advice.\n\nWhat would you like to know?`
    }];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg = { role: 'user', content: messageText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/chat/message`,
        { message: messageText, history: newMessages.slice(-10) },
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again!"
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    const fresh = [{
      role: 'assistant',
      content: `Hi ${user.full_name?.split(' ')[0]} 👋 I'm your AI Academic Advisor!\n\nI have full access to your assessment results and roadmap, so I can give you deeply personalized advice.\n\nWhat would you like to know?`
    }];
    setMessages(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Instrument Serif, serif' }}>
            AI Academic Advisor
          </h2>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
            Personalized advice based on your assessment and roadmap
          </p>
        </div>
        <button onClick={clearChat} style={{
          background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 10,
          padding: '7px 14px', cursor: 'pointer', color: '#64748B',
          fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          Clear chat
        </button>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 600, margin: '0 0 10px', letterSpacing: '0.5px' }}>
            TRY ASKING
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                padding: '8px 14px', borderRadius: 20,
                border: '1.5px solid #E2E8F0', background: 'white',
                color: '#475569', cursor: 'pointer', fontSize: 13,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.15s', fontWeight: 500
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex',
        flexDirection: 'column', gap: 16, padding: '4px 2px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: 10
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
              }}>🎓</div>
            )}
            <div style={{
              maxWidth: '74%', padding: '12px 16px', borderRadius: 18,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 18,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #1F4E79, #2563EB)'
                : 'white',
              color: msg.role === 'user' ? 'white' : '#1a1a2e',
              boxShadow: msg.role === 'user'
                ? '0 4px 12px rgba(37,99,235,0.25)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
              border: msg.role === 'assistant' ? '1px solid #F1F5F9' : 'none'
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'linear-gradient(135deg, #475569, #334155)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14,
                fontWeight: 800, color: 'white', flexShrink: 0
              }}>
                {user.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}>🎓</div>
            <div style={{
              padding: '14px 18px', background: 'white', borderRadius: 18,
              borderBottomLeftRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#3B82F6', animation: 'bounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ paddingTop: 16, borderTop: '1px solid #F1F5F9', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your future... (Enter to send)"
            rows={2}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 14,
              border: '1.5px solid #E2E8F0', fontSize: 14,
              resize: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
              background: '#F8FAFC'
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            padding: '0 22px', borderRadius: 14, border: 'none',
            background: loading || !input.trim()
              ? '#E2E8F0'
              : 'linear-gradient(135deg, #1F4E79, #2563EB)',
            color: loading || !input.trim() ? '#94A3B8' : 'white',
            fontSize: 20, flexShrink: 0,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !input.trim() ? 'none' : '0 4px 12px rgba(37,99,235,0.3)'
          }}>
            ➤
          </button>
        </div>
        <p style={{ color: '#CBD5E1', fontSize: 12, margin: '8px 0 0', textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-7px); }
        }
      `}</style>
    </div>
  );
}