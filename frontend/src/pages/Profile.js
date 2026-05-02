import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: '', country: '', academic_status: '', language: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/profile/me`,
      { headers: { Authorization: `Bearer ${user.access_token}` } }
    ).then(res => {
      setForm({
        full_name: res.data.full_name || '',
        country: res.data.country || '',
        academic_status: res.data.academic_status || '',
        language: res.data.language || 'en',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await axios.put(`${API_URL}/profile/me`, form,
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );
      login({ ...user, full_name: form.full_name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
    background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif'
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>Loading profile...</div>
  );

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 4, fontFamily: 'Instrument Serif, serif' }}>My Profile</h2>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 28 }}>Manage your personal information and preferences</p>

      {/* Avatar card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2744, #1F4E79, #2563EB)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: 'white', flexShrink: 0
        }}>
          {form.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: '0 0 4px', fontFamily: 'Instrument Serif, serif' }}>{form.full_name || 'Your Name'}</p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 4px' }}>{user.email}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>{form.academic_status} · {form.country}</p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        background: 'white', borderRadius: 20, padding: 28,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Edit Information</h3>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#15803D', fontSize: 13 }}>
            ✅ Profile saved successfully!
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#DC2626', fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={save}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handle} style={inputStyle} placeholder="Your full name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Country</label>
              <select name="country" value={form.country} onChange={handle} style={inputStyle}>
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

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Academic Status</label>
            <select name="academic_status" value={form.academic_status} onChange={handle} style={inputStyle}>
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

          {/* Account info */}
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', margin: '0 0 10px' }}>ACCOUNT INFO</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#94A3B8' }}>Email</span>
              <span style={{ color: '#475569', fontWeight: 500 }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#94A3B8' }}>Member since</span>
              <span style={{ color: '#475569', fontWeight: 500 }}>2026</span>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: 13,
            background: saving ? '#93C5FD' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
            color: 'white', border: 'none', borderRadius: 10,
            cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}