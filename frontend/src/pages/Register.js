import API_URL from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', full_name: '',
    country: '', academic_status: '', language: 'en'
  });
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
      const res = await axios.post(`${API_URL}/auth/register`, form);
      login({ ...res.data });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
    background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif'
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 0' }}>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, background: 'linear-gradient(135deg, #1F4E79, #3B82F6)',
          borderRadius: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24, margin: '0 auto 14px'
        }}>🎓</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', fontFamily: 'Instrument Serif, serif' }}>
          Create your account
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>
          Free forever · AI-powered · Made for Central Asia
        </p>
      </div>

      <div style={{
        background: 'white', borderRadius: 20, padding: 28,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9'
      }}>
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
            padding: '10px 14px', marginBottom: 18, color: '#DC2626', fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input name="full_name" placeholder="Your name" value={form.full_name} onChange={handle} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} style={inputStyle} required />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handle} style={inputStyle} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Country</label>
              <select name="country" value={form.country} onChange={handle} style={inputStyle} required>
                <option value="">Select country</option>
                <option>Kazakhstan</option>
                <option>Kyrgyzstan</option>
                <option>Uzbekistan</option>
                <option>Tajikistan</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Language</label>
              <select name="language" value={form.language} onChange={handle} style={inputStyle}>
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Russian</option>
                <option value="kz">🇰🇿 Kazakh</option>
                <option value="uz">🇺🇿 Uzbek</option>
                <option value="tj">🇹🇯 Tajik</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Academic Status</label>
            <select name="academic_status" value={form.academic_status} onChange={handle} style={inputStyle} required>
              <option value="">Select your grade</option>
              <optgroup label="Middle School">
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
              </optgroup>
              <optgroup label="High School">
                <option>Grade 10</option>
                <option>Grade 11</option>
              </optgroup>
              <optgroup label="Applying">
                <option>Grade 12</option>
                <option>Applying to University</option>
              </optgroup>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13,
            background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
            color: 'white', border: 'none', borderRadius: 10,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 700
          }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#64748B' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2563EB', fontWeight: 700 }}>Sign in</Link>
      </p>
    </div>
  );
}