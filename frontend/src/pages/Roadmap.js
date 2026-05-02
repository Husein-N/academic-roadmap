import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/roadmap/my`,
      { headers: { Authorization: `Bearer ${user.access_token}` } }
    ).then(res => { setRoadmaps(res.data.roadmaps); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
      <p style={{ color: '#64748B' }}>Loading your roadmap...</p>
    </div>
  );

  if (roadmaps.length === 0) return (
    <div style={{ textAlign: 'center', padding: 80, maxWidth: 400, margin: '0 auto' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🗺️</div>
      <h3 style={{ color: '#1a1a2e', fontSize: 22, fontWeight: 800, marginBottom: 10, fontFamily: 'Instrument Serif, serif' }}>No roadmap yet</h3>
      <p style={{ color: '#64748B', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
        Complete the interest assessment first to generate your personalized AI roadmap
      </p>
      <button onClick={() => navigate('/assessment')} style={{
        padding: '13px 28px', background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
        color: 'white', border: 'none', borderRadius: 12,
        cursor: 'pointer', fontSize: 15, fontWeight: 700,
        boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
      }}>
        Take Assessment →
      </button>
    </div>
  );

  const latest = roadmaps[roadmaps.length - 1].content;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Instrument Serif, serif' }}>
          My Academic Roadmap
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
          AI-generated guidance based on your full assessment profile
        </p>
      </div>

      {/* Hero — Recommended Major */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2744 0%, #1F4E79 60%, #2563EB 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 20,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -50, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', margin: '0 0 8px' }}>
          RECOMMENDED DIRECTION
        </p>
        <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 12px', fontFamily: 'Instrument Serif, serif' }}>
          {latest.recommended_major}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>
          {latest.why_this_major}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {latest.top_interests?.map((interest, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500
            }}>
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Motivational message */}
      {latest.motivational_message && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 14, padding: '14px 18px', marginBottom: 20,
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ margin: 0, color: '#92400E', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
            {latest.motivational_message}
          </p>
        </div>
      )}

      {/* Career paths & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>🎯 Career Paths</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {latest.career_paths?.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#475569' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>🔑 Skills to Develop</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {latest.key_skills_to_develop?.map((s, i) => (
              <span key={i} style={{
                fontSize: 12, background: '#F5F3FF', color: '#6D28D9',
                padding: '4px 12px', borderRadius: 20, fontWeight: 500
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Step by step plan */}
      <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
        <h3 style={{ color: '#1a1a2e', fontSize: 17, fontWeight: 700, margin: '0 0 20px' }}>📋 Your Step-by-Step Plan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {latest.steps?.map((step, i) => (
            <div key={step.step} style={{ display: 'flex', gap: 16, position: 'relative' }}>
              {/* Line connector */}
              {i < latest.steps.length - 1 && (
                <div style={{ position: 'absolute', left: 18, top: 38, bottom: -20, width: 2, background: '#E2E8F0', zIndex: 0 }} />
              )}
              <div style={{
                width: 36, height: 36, background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
                color: 'white', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0, fontSize: 14, zIndex: 1,
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
              }}>
                {step.step}
              </div>
              <div style={{ paddingBottom: i < latest.steps.length - 1 ? 24 : 0, flex: 1 }}>
                <h4 style={{ margin: '0 0 6px', color: '#1a1a2e', fontSize: 15, fontWeight: 700 }}>{step.title}</h4>
                <p style={{ margin: 0, color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universities */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ color: '#1a1a2e', fontSize: 17, fontWeight: 700, margin: '0 0 16px' }}>🏛️ Recommended Universities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {latest.universities?.map((uni, i) => (
            <div key={i} style={{
              padding: 18, background: 'white', borderRadius: 16,
              border: `2px solid ${i === 0 ? '#3B82F6' : '#F1F5F9'}`,
              boxShadow: i === 0 ? '0 4px 16px rgba(59,130,246,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative', overflow: 'hidden'
            }}>
              {i === 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1F4E79, #2563EB)' }} />
              )}
              {i === 0 && (
                <span style={{ display: 'inline-block', background: '#EFF6FF', color: '#1D4ED8', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 10 }}>
                  ⭐ Best Match
                </span>
              )}
              {uni.location_type === 'local' ? (
                <span style={{ display: 'inline-block', background: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginBottom: 10, marginLeft: i === 0 ? 6 : 0 }}>
                  🏠 Local
                </span>
              ) : (
                <span style={{ display: 'inline-block', background: '#F5F3FF', color: '#6D28D9', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, marginBottom: 10 }}>
                  ✈️ Abroad
                </span>
              )}
              <h4 style={{ margin: '0 0 4px', color: '#1a1a2e', fontSize: 14, fontWeight: 700 }}>
                {uni.full_name || uni.name}
              </h4>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748B' }}>
                📍 {uni.city ? `${uni.city}, ` : ''}{uni.country}
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: '#475569', fontWeight: 600 }}>
                {uni.program}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#10B981', fontWeight: 700 }}>
                {uni.tuition}
              </p>
              {uni.grant_available && (
                <span style={{ display: 'inline-block', fontSize: 11, background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: 6, marginBottom: 8 }}>
                  ✅ Grant available
                </span>
              )}
              {uni.entrance_exam && (
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94A3B8' }}>📝 {uni.entrance_exam}</p>
              )}
              {uni.why_recommended && (
                <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', lineHeight: 1.5, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                  {uni.why_recommended}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Retake */}
      <div style={{ textAlign: 'center', paddingBottom: 20 }}>
        <button onClick={() => navigate('/assessment')} style={{
          background: 'none', border: 'none', color: '#94A3B8',
          cursor: 'pointer', fontSize: 13, textDecoration: 'underline'
        }}>
          Retake assessment to regenerate roadmap
        </button>
      </div>
    </div>
  );
}