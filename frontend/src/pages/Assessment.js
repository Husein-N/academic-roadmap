import API_URL from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IMAGES = [
  { id: 1, emoji: '🩺', label: 'Doctor', categories: ['social', 'investigative'] },
  { id: 2, emoji: '💻', label: 'Coding', categories: ['investigative', 'conventional'] },
  { id: 3, emoji: '🎨', label: 'Artist', categories: ['artistic'] },
  { id: 4, emoji: '🌉', label: 'Engineering', categories: ['realistic', 'investigative'] },
  { id: 5, emoji: '👩‍🏫', label: 'Teaching', categories: ['social'] },
  { id: 6, emoji: '⚖️', label: 'Law', categories: ['enterprising', 'social'] },
  { id: 7, emoji: '📊', label: 'Business', categories: ['enterprising', 'conventional'] },
  { id: 8, emoji: '🔬', label: 'Science', categories: ['investigative'] },
  { id: 9, emoji: '🎵', label: 'Music', categories: ['artistic', 'enterprising'] },
  { id: 10, emoji: '🌿', label: 'Nature', categories: ['realistic'] },
  { id: 11, emoji: '🎙️', label: 'Journalism', categories: ['artistic', 'social'] },
  { id: 12, emoji: '📐', label: 'Architecture', categories: ['realistic', 'artistic'] },
  { id: 13, emoji: '🧠', label: 'Psychology', categories: ['social', 'investigative'] },
  { id: 14, emoji: '🚀', label: 'Space', categories: ['investigative', 'realistic'] },
  { id: 15, emoji: '👨‍🍳', label: 'Chef', categories: ['realistic', 'artistic'] },
  { id: 16, emoji: '⚽', label: 'Sports', categories: ['realistic', 'social'] },
  { id: 17, emoji: '🎬', label: 'Filmmaker', categories: ['artistic'] },
  { id: 18, emoji: '💡', label: 'Startup', categories: ['enterprising'] },
  { id: 19, emoji: '🏥', label: 'Surgery', categories: ['investigative', 'realistic'] },
  { id: 20, emoji: '🎮', label: 'Game Design', categories: ['artistic', 'investigative'] },
  { id: 21, emoji: '🤝', label: 'Social Work', categories: ['social'] },
  { id: 22, emoji: '✈️', label: 'Pilot', categories: ['realistic', 'conventional'] },
  { id: 23, emoji: '📚', label: 'Research', categories: ['investigative'] },
  { id: 24, emoji: '📈', label: 'Data', categories: ['conventional'] },
];

const SCENARIOS = [
  {
    id: 1, aptitude: ['logical', 'mathematical'],
    question: 'Your phone battery drops 30% per hour watching video, 10% per hour reading. You have 40% left and 3 hours until home. What do you do?',
    options: [
      { text: 'Switch to reading to make it last', score: { logical: 2 } },
      { text: 'Turn it off completely', score: { practical: 2 } },
      { text: 'Keep watching and hope for the best', score: {} },
      { text: 'Ask someone to borrow their charger', score: { social: 1 } },
    ]
  },
  {
    id: 2, aptitude: ['verbal', 'social'],
    question: 'A new student joins your class and looks lost and nervous. You:',
    options: [
      { text: 'Wait for a teacher to help them', score: {} },
      { text: 'Walk over, introduce yourself and show them around', score: { social: 2, verbal: 2 } },
      { text: 'Smile but say nothing', score: {} },
      { text: 'Ask a friend to go talk to them', score: { social: 1 } },
    ]
  },
  {
    id: 3, aptitude: ['organizational'],
    question: 'You have a big exam in 2 weeks and 5 subjects to study. Your first move is:',
    options: [
      { text: 'Open any book and start', score: {} },
      { text: 'Make a study plan dividing subjects by day', score: { organizational: 2 } },
      { text: 'Study only your favorite subject', score: {} },
      { text: 'Wait until next week to start', score: {} },
    ]
  },
  {
    id: 4, aptitude: ['interpersonal'],
    question: 'Two friends ask you to join their separate birthday parties on the same day. You:',
    options: [
      { text: 'Pick the closer friend and feel bad', score: {} },
      { text: 'Try to attend both for a while', score: { interpersonal: 2 } },
      { text: 'Suggest they combine the parties', score: { creative: 2, social: 1 } },
      { text: 'Cancel both to avoid choosing', score: {} },
    ]
  },
  {
    id: 5, aptitude: ['mechanical', 'technical'],
    question: 'Your bicycle chain falls off. No one is around. You:',
    options: [
      { text: 'Leave the bike and walk', score: {} },
      { text: 'Try to figure it out by looking at how it works', score: { mechanical: 2 } },
      { text: 'Search YouTube then try to fix it', score: { technical: 2 } },
      { text: 'Call someone to come fix it', score: { social: 1 } },
    ]
  },
  {
    id: 6, aptitude: ['leadership'],
    question: 'Your group project has no leader and everyone disagrees on the topic. You:',
    options: [
      { text: 'Stay quiet and go with whatever', score: {} },
      { text: 'Suggest everyone votes on the best idea', score: { leadership: 2 } },
      { text: 'Take charge and make the decision', score: { leadership: 2 } },
      { text: 'Let two others debate it out', score: {} },
    ]
  },
  {
    id: 7, aptitude: ['creative'],
    question: 'A pencil — give an unusual use for it (NOT writing):',
    type: 'text',
  },
  {
    id: 8, aptitude: ['logical', 'interpersonal', 'ethical'],
    question: 'You worked hard on a group project but your teammate did almost nothing. The teacher asks everyone to rate their teammates. What do you do?',
    options: [
      { text: 'Give them full marks to avoid conflict', score: {} },
      { text: 'Give them the grade they actually deserve', score: { logical: 2, organizational: 1 } },
      { text: 'Talk to them privately before submitting the ratings', score: { interpersonal: 2, social: 2 } },
      { text: 'Ask the teacher to handle it', score: { leadership: 1 } },
    ]
  },
];

const VALUES_QUESTIONS = [
  { id: 1, a: '💛 Job you LOVE with average pay', b: '💰 Job you dislike with HIGH pay', map: { a: 'passion', b: 'financial' } },
  { id: 2, a: '🧘 Work ALONE productively', b: '👥 Work in a TEAM and have fun', map: { a: 'independent', b: 'collaborative' } },
  { id: 3, a: '🏠 Stable predictable career', b: '🎢 Exciting unpredictable career', map: { a: 'stability', b: 'adventure' } },
  { id: 4, a: '🌟 Be FAMOUS in your field', b: '🤝 Make a quiet real difference', map: { a: 'recognition', b: 'impact' } },
  { id: 5, a: '👑 Lead and manage others', b: '🎯 Be the best individual expert', map: { a: 'leadership', b: 'mastery' } },
  { id: 6, a: '🌍 Work that helps society', b: '🤖 Work that pushes technology', map: { a: 'social_good', b: 'innovation' } },
];

const SLIDERS = [
  { id: 1, left: 'Prefer working ALONE', right: 'Prefer working with PEOPLE', key: 'social_orientation' },
  { id: 2, left: 'Go with FEELINGS', right: 'Go with LOGIC', key: 'thinking_style' },
  { id: 3, left: 'Love ROUTINE & structure', right: 'Love VARIETY & change', key: 'structure_preference' },
  { id: 4, left: 'Focus on BIG PICTURE', right: 'Focus on DETAILS', key: 'focus_style' },
];

// ─── PROGRESS BAR ───
function ProgressBar({ current }) {
  const steps = ['Interests', 'Aptitudes', 'Values', 'Personality', 'Open Questions'];
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: '#E2E8F0', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 16, left: 0, height: 2, background: 'linear-gradient(90deg, #3B82F6, #10B981)', zIndex: 1, width: `${(current / 4) * 100}%`, transition: 'width 0.4s ease' }} />
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: i < current ? 'linear-gradient(135deg, #3B82F6, #10B981)' : i === current ? '#1F4E79' : 'white',
              border: i >= current && i !== current ? '2px solid #E2E8F0' : 'none',
              color: i <= current ? 'white' : '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, marginBottom: 8,
              boxShadow: i === current ? '0 0 0 4px rgba(31,78,121,0.15)' : 'none',
              transition: 'all 0.3s'
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 11, color: i <= current ? '#1F4E79' : '#94A3B8', fontWeight: i === current ? 700 : 500 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE WRAPPER ───
function ModuleCard({ children, title, subtitle, icon }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
        <div>
          <h3 style={{ color: '#1a1a2e', fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <p style={{ color: '#64748B', fontSize: 13, margin: '3px 0 0' }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ height: 1, background: '#F1F5F9', margin: '20px 0' }} />
      {children}
    </div>
  );
}

// ─── MODULE 1: IMAGE GRID ───
function Module1({ onNext }) {
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <ModuleCard icon="🖼️" title="Interests Explorer" subtitle="Tap all the images that excite or interest you — go with your first instinct!">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 28 }}>
        {IMAGES.map(img => {
          const isSelected = selected.includes(img.id);
          return (
            <div key={img.id} onClick={() => toggle(img.id)} style={{
              padding: '14px 8px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
              border: `2px solid ${isSelected ? '#3B82F6' : '#F1F5F9'}`,
              background: isSelected ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : '#FAFAFA',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s', boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.2)' : 'none'
            }}>
              <div style={{ fontSize: 28, marginBottom: 5 }}>{img.emoji}</div>
              <div style={{ fontSize: 11, color: isSelected ? '#2563EB' : '#64748B', fontWeight: isSelected ? 700 : 500 }}>{img.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
          {selected.length === 0 ? 'Select at least one' : `${selected.length} selected`}
        </span>
        <button style={{
          padding: '12px 28px', background: 'linear-gradient(135deg, #1F4E79, #2563EB)',
          color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
          fontSize: 14, fontWeight: 700
        }} onClick={() => onNext({ selectedImages: selected, imageData: IMAGES })}>
          Next Module →
        </button>
      </div>
    </ModuleCard>
  );
}

// ─── MODULE 2: SCENARIOS ───
function Module2({ onNext }) {
  const [answers, setAnswers] = useState({});
  const setAnswer = (qId, value) => setAnswers(prev => ({ ...prev, [qId]: value }));
  const answered = Object.keys(answers).length;

  return (
    <ModuleCard icon="🧠" title="Aptitude Scenarios" subtitle="Choose the answer that feels most natural to you">
      {SCENARIOS.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < SCENARIOS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
            <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap', marginTop: 2 }}>Q{i + 1}</span>
            <p style={{ fontWeight: 600, color: '#1a1a2e', margin: 0, fontSize: 15, lineHeight: 1.5 }}>{q.question}</p>
          </div>
          {q.type === 'text' ? (
            <input placeholder="Type your creative answer here..."
              value={answers[q.id] || ''}
              onChange={e => setAnswer(q.id, e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif', boxSizing: 'border-box' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, j) => {
                const isSelected = answers[q.id] === j;
                return (
                  <div key={j} onClick={() => setAnswer(q.id, j)} style={{
                    padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
                    background: isSelected ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : '#FAFAFA',
                    color: isSelected ? '#1D4ED8' : '#475569',
                    fontSize: 14, fontWeight: isSelected ? 600 : 400, transition: 'all 0.15s'
                  }}>
                    {opt.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>{answered}/{SCENARIOS.length} answered</span>
        <button style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #1F4E79, #2563EB)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          onClick={() => onNext({ scenarioAnswers: answers })}>
          Next Module →
        </button>
      </div>
    </ModuleCard>
  );
}

// ─── MODULE 3: VALUES ───
function Module3({ onNext }) {
  const [answers, setAnswers] = useState({});

  return (
    <ModuleCard icon="⚖️" title="Values & Priorities" subtitle="Tap the option that feels more like you — go with your gut!">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {VALUES_QUESTIONS.map((q, i) => (
          <div key={q.id}>
            <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, margin: '0 0 8px', letterSpacing: '0.5px' }}>QUESTION {i + 1}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['a', 'b'].map(side => {
                const isSelected = answers[q.id] === side;
                return (
                  <div key={side} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: side }))} style={{
                    padding: '16px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
                    background: isSelected ? 'linear-gradient(135deg, #1F4E79, #2563EB)' : 'white',
                    color: isSelected ? 'white' : '#475569',
                    fontWeight: isSelected ? 700 : 400, fontSize: 14, transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
                  }}>
                    {q[side]}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>{Object.keys(answers).length}/{VALUES_QUESTIONS.length} answered</span>
        <button style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #1F4E79, #2563EB)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          onClick={() => onNext({ valuesAnswers: answers, valuesData: VALUES_QUESTIONS })}>
          Next Module →
        </button>
      </div>
    </ModuleCard>
  );
}

// ─── MODULE 4: SLIDERS ───
function Module4({ onNext }) {
  const [values, setValues] = useState({ 1: 50, 2: 50, 3: 50, 4: 50 });

  return (
    <ModuleCard icon="🎚️" title="Personality Sliders" subtitle="Drag each slider to where you feel you are — be honest!">
      <div style={{ marginBottom: 28 }}>
        {SLIDERS.map(s => (
          <div key={s.id} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: values[s.id] <= 40 ? '#1D4ED8' : '#94A3B8', fontWeight: values[s.id] <= 40 ? 700 : 400, maxWidth: '42%' }}>{s.left}</span>
              <span style={{ fontSize: 13, color: values[s.id] >= 60 ? '#1D4ED8' : '#94A3B8', fontWeight: values[s.id] >= 60 ? 700 : 400, maxWidth: '42%', textAlign: 'right' }}>{s.right}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input type="range" min={0} max={100} value={values[s.id]}
                onChange={e => setValues(prev => ({ ...prev, [s.id]: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer', height: 6 }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: '#94A3B8', background: '#F8FAFC', padding: '2px 10px', borderRadius: 10 }}>
                {values[s.id] < 30 ? '← ' + s.left.split(' ').slice(-1)[0] : values[s.id] > 70 ? s.right.split(' ').slice(-1)[0] + ' →' : '⚖️ Balanced'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #1F4E79, #2563EB)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
          onClick={() => onNext({ sliderValues: values, sliderData: SLIDERS })}>
          Next Module →
        </button>
      </div>
    </ModuleCard>
  );
}

// ─── MODULE 5: OPEN QUESTIONS ───
function Module5({ onNext, loading }) {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  const taStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 10,
    border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'vertical',
    minHeight: 90, background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif',
    lineHeight: 1.6, boxSizing: 'border-box', outline: 'none'
  };

  return (
    <ModuleCard icon="💬" title="Open Questions" subtitle="Just 2 questions — write whatever comes to mind, don't overthink it!">
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 600, color: '#1a1a2e', margin: '0 0 10px', fontSize: 15 }}>
          1. What is one thing you do where you completely lose track of time?
        </p>
        <textarea value={q1} onChange={e => setQ1(e.target.value)}
          placeholder="e.g. When I'm building something, coding, playing music..." style={taStyle} />
      </div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 600, color: '#1a1a2e', margin: '0 0 10px', fontSize: 15 }}>
          2. If you could solve ONE problem in the world, what would it be and why?
        </p>
        <textarea value={q2} onChange={e => setQ2(e.target.value)}
          placeholder="e.g. I would solve access to quality education because..." style={taStyle} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '13px 32px', background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
          color: 'white', border: 'none', borderRadius: 10,
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700
        }} onClick={() => onNext({ openQ1: q1, openQ2: q2 })} disabled={loading}>
          {loading ? '⚡ Analyzing your profile...' : '✨ Generate My Profile →'}
        </button>
      </div>
    </ModuleCard>
  );
}

// ─── RESULT ───
function Result({ result, onGenerateRoadmap, loading }) {
  const fieldEmojis = {
    Psychology: '🧠', Medicine: '🩺', Research: '🔬', Education: '👩‍🏫',
    Law: '⚖️', Engineering: '🔧', 'Computer Science': '💻', Business: '💼',
    Art: '🎨', Journalism: '🎙️', Architecture: '🏛️', Finance: '📊',
    'Data Science': '📈', Design: '🎨', 'Social Work': '🤝',
  };

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <h2 style={{ color: '#1a1a2e', fontSize: 24, fontWeight: 800, margin: '0 0 8px', fontFamily: 'Instrument Serif, serif' }}>
          Your Profile is Ready!
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Based on all 5 modules of your assessment</p>
      </div>

      {/* Profile grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {[
          { label: '🎯 Top Interest Areas', value: result.top_interests?.join(' + '), bg: '#EFF6FF', color: '#1D4ED8' },
          { label: '🧠 Strongest Aptitudes', value: result.top_aptitudes?.join(', '), bg: '#F0FDF4', color: '#15803D' },
          { label: '💎 Core Values', value: result.top_values?.join(', '), bg: '#FFFBEB', color: '#B45309' },
          { label: '🌀 Your Style', value: result.personality_style, bg: '#F5F3FF', color: '#6D28D9' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ padding: 18, background: bg, borderRadius: 14 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color, fontSize: 13 }}>{label}</p>
            <p style={{ margin: 0, color: '#1a1a2e', fontSize: 14, fontWeight: 500 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Best fields */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px', fontSize: 15 }}>✨ Best Matching Fields</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {result.best_fields?.map((field, i) => (
            <div key={i} style={{
              padding: '10px 18px', borderRadius: 24,
              background: i === 0 ? 'linear-gradient(135deg, #1F4E79, #2563EB)' : '#F1F5F9',
              color: i === 0 ? 'white' : '#475569',
              fontWeight: i === 0 ? 700 : 500, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: i === 0 ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
            }}>
              {fieldEmojis[field] || '🎓'} {field}
              {i === 0 && <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: 10 }}>Best match</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button style={{
          padding: '14px 40px', fontSize: 16, fontWeight: 700,
          background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
          color: 'white', border: 'none', borderRadius: 12,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)'
        }} onClick={onGenerateRoadmap} disabled={loading}>
          {loading ? '🗺️ Building your roadmap...' : '🗺️ Generate My Roadmap →'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function Assessment() {
  const [module, setModule] = useState(0);
  const [allData, setAllData] = useState({});
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('assessment_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const processAndSubmit = async (finalData) => {
    setLoading(true);
    const merged = { ...allData, ...finalData };

    const interestVector = {};
    if (merged.selectedImages && merged.imageData) {
      merged.imageData.forEach(img => {
        if (merged.selectedImages.includes(img.id)) {
          img.categories.forEach(cat => { interestVector[cat] = (interestVector[cat] || 0) + 1; });
        }
      });
    }

    const aptitudeScores = {};
    if (merged.scenarioAnswers) {
      SCENARIOS.forEach(q => {
        const ans = merged.scenarioAnswers[q.id];
        if (ans !== undefined && q.options) {
          const scores = q.options[ans]?.score || {};
          Object.entries(scores).forEach(([k, v]) => { aptitudeScores[k] = (aptitudeScores[k] || 0) + v; });
        }
        if (q.type === 'text' && merged.scenarioAnswers[q.id]) {
          aptitudeScores['creative'] = (aptitudeScores['creative'] || 0) + 2;
        }
      });
    }

    const valuesProfile = {};
    if (merged.valuesAnswers && merged.valuesData) {
      merged.valuesData.forEach(q => {
        const choice = merged.valuesAnswers[q.id];
        if (choice) valuesProfile[q.map[choice]] = (valuesProfile[q.map[choice]] || 0) + 1;
      });
    }

    const personality = {};
    if (merged.sliderValues && merged.sliderData) {
      merged.sliderData.forEach(s => { personality[s.key] = merged.sliderValues[s.id]; });
    }

    const topInterests = Object.entries(interestVector).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const topAptitudes = Object.entries(aptitudeScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const topValues = Object.entries(valuesProfile).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k.replace('_', ' '));

    const socialScore = personality['social_orientation'] || 50;
    const logicScore = personality['thinking_style'] || 50;
    const personalityStyle = `${socialScore > 60 ? 'Team-oriented' : 'Independent'}, ${logicScore > 60 ? 'Logical' : 'Feeling-driven'}, ${(personality['focus_style'] || 50) < 50 ? 'Big-picture' : 'Detail-focused'}`;

    const fieldMap = {
      investigative: ['Research', 'Medicine', 'Data Science'],
      social: ['Psychology', 'Education', 'Social Work'],
      artistic: ['Design', 'Journalism', 'Architecture'],
      enterprising: ['Business', 'Law'],
      realistic: ['Engineering'],
      conventional: ['Finance'],
    };
    const bestFields = [...new Set(topInterests.flatMap(i => fieldMap[i] || []))].slice(0, 5);

    const profileResult = {
      top_interests: topInterests,
      top_aptitudes: topAptitudes,
      top_values: topValues,
      personality_style: personalityStyle,
      best_fields: bestFields.length > 0 ? bestFields : ['Computer Science', 'Business'],
      interest_vector: interestVector,
      aptitude_scores: aptitudeScores,
      open_q1: merged.openQ1,
      open_q2: merged.openQ2,
    };

    localStorage.setItem('assessment_result', JSON.stringify(profileResult));

    try {
      const assessRes = await axios.post(
        `${API_URL}/assessment/submit`,
        { answers: [{ question_id: 1, score: 3 }], profile_data: profileResult },
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );
      localStorage.setItem('assessment_id', assessRes.data.assessment_id);
    } catch (e) { }

    setResult(profileResult);
    setLoading(false);
  };

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const assessmentId = localStorage.getItem('assessment_id');
      if (!assessmentId) { setLoading(false); return; }

      try {
        await axios.get(`${API_URL}/roadmap/by-assessment/${assessmentId}`,
          { headers: { Authorization: `Bearer ${user.access_token}` } });
        navigate('/roadmap');
        return;
      } catch (e) {
        await axios.post(`${API_URL}/roadmap/generate`,
          { assessment_id: assessmentId, language: 'en', profile_data: result },
          { headers: { Authorization: `Bearer ${user.access_token}` } });
        navigate('/roadmap');
      }
    } catch (e) { navigate('/roadmap'); }
    setLoading(false);
  };

  const retakeAssessment = () => {
    localStorage.removeItem('assessment_result');
    localStorage.removeItem('assessment_id');
    setResult(null);
    setModule(0);
    setAllData({});
  };

  const handleNext = (data) => {
    const merged = { ...allData, ...data };
    setAllData(merged);
    if (module < 4) setModule(module + 1);
    else processAndSubmit(merged);
  };

  const modules = [Module1, Module2, Module3, Module4, Module5];
  const CurrentModule = modules[module];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Instrument Serif, serif' }}>
          Interest & Aptitude Assessment
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>~12 minutes · 5 modules · Fully personalized to you</p>
      </div>

      <ProgressBar current={result ? 5 : module} />

      {result ? (
        <div>
          <Result result={result} onGenerateRoadmap={generateRoadmap} loading={loading} />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={retakeAssessment} style={{
              background: 'none', border: 'none', color: '#94A3B8',
              cursor: 'pointer', fontSize: 13, textDecoration: 'underline'
            }}>
              Retake assessment
            </button>
          </div>
        </div>
      ) : (
        <CurrentModule onNext={handleNext} loading={loading} />
      )}
    </div>
  );
}