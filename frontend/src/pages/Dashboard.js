import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasAssessment = !!localStorage.getItem('assessment_result');
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [profile, setProfile] = useState({});



  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    axios.get(`${API_URL}/roadmap/my`,
      { headers: { Authorization: `Bearer ${user.access_token}` } }
    ).then(res => setHasRoadmap(res.data.roadmaps.length > 0)).catch(() => { });

    axios.get(`${API_URL}/profile/me`,
      { headers: { Authorization: `Bearer ${user.access_token}` } }
    ).then(res => setProfile(res.data)).catch(() => { });
  }, [user]);

  const cards = [
    {
      path: '/assessment',
      emoji: '📝',
      title: 'Interest Assessment',
      description: 'Discover your strengths, aptitudes, and interests through our 5-module assessment',
      color: '#3B82F6',
      bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
      done: hasAssessment,
      doneText: 'Completed ✓',
      cta: hasAssessment ? 'Retake Assessment' : 'Start Assessment',
    },
    {
      path: '/roadmap',
      emoji: '🗺️',
      title: 'My Roadmap',
      description: 'Your personalized AI-generated academic roadmap based on your assessment results',
      color: '#10B981',
      bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
      done: hasRoadmap,
      doneText: 'Generated ✓',
      cta: hasRoadmap ? 'View Roadmap' : 'Generate Roadmap',
    },
    {
      path: '/programs',
      emoji: '🏛️',
      title: 'Compare Programs',
      description: 'Compare university programs from NU, AUCA, NewUU and find the best fit for you',
      color: '#F59E0B',
      bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
      done: false,
      cta: 'Explore Programs',
    },
    {
      path: '/chat',
      emoji: '💬',
      title: 'AI Advisor',
      description: 'Chat with your personal AI academic advisor — it knows your assessment and roadmap',
      color: '#8B5CF6',
      bg: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
      done: false,
      cta: 'Ask Anything',
    },
  ];

  return (
    <div>
      {/* Hero greeting */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2744 0%, #1F4E79 60%, #2563EB 100%)',
        borderRadius: 20, padding: '36px 40px', marginBottom: 28,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
          {greeting} 👋
        </p>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px', fontFamily: 'Instrument Serif, serif' }}>
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 500, lineHeight: 1.6, marginBottom: 24 }}>
          Your AI-powered academic guidance platform for students across Central Asia. Let's find your perfect path.
        </p>

        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Universities', value: '3' },
            { label: 'Programs', value: '44+' },
            { label: 'Countries', value: '3' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0 }}>{value}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '16px 24px',
        marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>YOUR PROGRESS</span>
        <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3 }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: 'linear-gradient(90deg, #3B82F6, #10B981)',
            width: hasRoadmap ? '100%' : hasAssessment ? '50%' : '10%',
            transition: 'width 0.6s ease'
          }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1F4E79' }}>
          {hasRoadmap ? 'Complete 🎉' : hasAssessment ? 'Step 2 of 3' : 'Step 1 of 3'}
        </span>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cards.map((card) => (
          <div key={card.path} style={{
            background: card.bg, borderRadius: 16, padding: 24,
            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
            onClick={() => navigate(card.path)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'white', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {card.emoji}
              </div>
              {card.done && (
                <span style={{
                  background: 'white', color: card.color, fontSize: 11,
                  fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}>
                  {card.doneText}
                </span>
              )}
            </div>
            <h3 style={{ color: '#1a1a2e', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{card.title}</h3>
            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>{card.description}</p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: card.color, fontSize: 13, fontWeight: 700
            }}>
              {card.cta} →
            </div>
          </div>
        ))}
      </div>

      {/* Student info bar */}
      <div style={{
        marginTop: 20, background: 'white', borderRadius: 14,
        padding: '14px 24px', display: 'flex', gap: 28, alignItems: 'center',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.5px' }}>YOUR PROFILE</span>
        {[
          { icon: '🌍', label: profile?.country || 'Not set' },
          { icon: '🎓', label: profile?.academic_status || 'Not set' },
          { icon: '🌐', label: profile?.language === 'en' ? 'English' : profile?.language === 'ru' ? 'Russian' : profile?.language === 'kz' ? 'Kazakh' : profile?.language === 'uz' ? 'Uzbek' : profile?.language === 'tj' ? 'Tajik' : 'English' },
        ].map(({ icon, label }) => (
          <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{icon}</span>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => navigate('/profile')} style={{
            background: '#F1F5F9', border: 'none', color: '#475569',
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 600
          }}>
            Edit Profile →
          </button>
        </div>
      </div>
    </div>
  );
}