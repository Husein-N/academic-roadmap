import API_URL from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, form);
      login({ ...res.data });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
    background: '#F8FAFC', transition: 'border 0.2s',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg, #1F4E79, #3B82F6)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26, margin: '0 auto 16px'
          }}>🎓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px', fontFamily: 'Instrument Serif, serif' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>Sign in to your RoadmapAI account</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9'
        }}>
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
              padding: '10px 14px', marginBottom: 20, color: '#DC2626', fontSize: 13
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handle} style={inputStyle} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <input name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handle} style={inputStyle} required />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 13,
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
              color: 'white', border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px'
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563EB', fontWeight: 700 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}