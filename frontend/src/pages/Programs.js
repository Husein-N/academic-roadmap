import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard']; // eslint-disable-line
const DIFFICULTY_COLORS = ['', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'];

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterUni, setFilterUni] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/programs/`),
      axios.get(`${API_URL}/programs/universities`)
    ]).then(([progRes, uniRes]) => {
      setPrograms(progRes.data.programs);
      setUniversities(uniRes.data.universities);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleSelect = (p) => {
    if (selected.find(s => s.id === p.id)) {
      setSelected(selected.filter(s => s.id !== p.id));
    } else if (selected.length < 3) {
      setSelected([...selected, p]);
    } else {
      alert('Maximum 3 programs can be compared');
    }
  };

  const filtered = programs.filter(p => {
    const matchCountry = !filterCountry || p.country === filterCountry;
    const matchUni = !filterUni || p.university === filterUni;
    const matchSearch = !search || p.program.toLowerCase().includes(search.toLowerCase());
    return matchCountry && matchUni && matchSearch;
  });

  const countries = [...new Set(universities.map(u => u.country))];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🏛️</div>
      Loading programs...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', fontFamily: 'Instrument Serif, serif' }}>
          University Programs
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>
          {programs.length} verified programs across {universities.length} universities · Select up to 3 to compare
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: 16, padding: '16px 20px',
        marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap'
      }}>
        <input
          placeholder="🔍 Search programs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#F8FAFC'
          }}
        />
        <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterUni(''); }}
          style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif', cursor: 'pointer' }}>
          <option value="">All Countries</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterUni} onChange={e => setFilterUni(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, sans-serif', cursor: 'pointer' }}>
          <option value="">All Universities</option>
          {universities
            .filter(u => !filterCountry || u.country === filterCountry)
            .map(u => <option key={u.id} value={u.name}>{u.name} — {u.city}</option>)}
        </select>

        {selected.length >= 2 && (
          <button onClick={() => setComparing(!comparing)} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: comparing ? '#F1F5F9' : 'linear-gradient(135deg, #1F4E79, #2563EB)',
            color: comparing ? '#475569' : 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap'
          }}>
            {comparing ? '← Back to List' : `Compare ${selected.length} Programs`}
          </button>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && !comparing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, alignSelf: 'center' }}>SELECTED:</span>
          {selected.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#1D4ED8'
            }}>
              <span>{p.program} @ {p.university}</span>
              <span onClick={() => toggleSelect(p)} style={{ cursor: 'pointer', color: '#93C5FD', fontWeight: 700 }}>×</span>
            </div>
          ))}
        </div>
      )}

      {/* COMPARE VIEW */}
      {comparing && selected.length >= 2 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#1a1a2e', fontWeight: 800, marginBottom: 20, fontFamily: 'Instrument Serif, serif' }}>
            Side-by-Side Comparison
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', background: '#F8FAFC', color: '#64748B', fontWeight: 600, textAlign: 'left', borderRadius: '10px 0 0 0', fontSize: 12 }}>FEATURE</th>
                  {selected.map((p, i) => (
                    <th key={p.id} style={{ padding: '12px 16px', background: i === 0 ? 'linear-gradient(135deg, #1F4E79, #2563EB)' : '#F8FAFC', color: i === 0 ? 'white' : '#1a1a2e', fontWeight: 700, textAlign: 'left' }}>
                      <div>{p.full_name || p.university}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 400 }}>{p.program}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Country & City', fn: p => `${p.country}, ${p.city}` },
                  { label: 'Degree', fn: p => p.degree },
                  { label: 'Duration', fn: p => `${p.duration_years} years` },
                  { label: 'Language', fn: p => p.language },
                  { label: 'Tuition/year', fn: p => p.tuition_usd ? `$${p.tuition_usd.toLocaleString()}` : 'N/A' },
                  { label: 'Grant Available', fn: p => p.grant_available ? '✅ Yes' : '❌ No' },
                  { label: 'Entrance Exam', fn: p => p.entrance_exam || 'N/A' },
                  { label: 'Difficulty', fn: p => `${DIFFICULTY_LABELS[p.difficulty]} (${p.difficulty}/5)` },
                ].map(({ label, fn }) => {
                  const vals = selected.map(p => fn(p));
                  const allSame = vals.every(v => v === vals[0]);
                  return (
                    <tr key={label}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748B', fontSize: 13, background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>{label}</td>
                      {selected.map((p, i) => (
                        <td key={p.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', background: !allSame ? '#FFFBEB' : 'white', color: '#1a1a2e' }}>
                          {fn(p)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748B', fontSize: 13, background: '#FAFAFA' }}>Career Paths</td>
                  {selected.map(p => (
                    <td key={p.id} style={{ padding: '12px 16px', fontSize: 13, color: '#475569', verticalAlign: 'top' }}>
                      {p.careers?.split(',').slice(0, 3).join(', ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748B', fontSize: 13, background: '#FAFAFA' }}>Key Subjects</td>
                  {selected.map(p => (
                    <td key={p.id} style={{ padding: '12px 16px', fontSize: 13, color: '#475569', verticalAlign: 'top' }}>
                      {p.subjects?.split(',').slice(0, 4).join(', ')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PROGRAM CARDS */
        <div>
          <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 14 }}>
            Showing {filtered.length} of {programs.length} programs
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map(p => {
              const isSelected = selected.find(s => s.id === p.id);
              return (
                <div key={p.id} onClick={() => toggleSelect(p)} style={{
                  padding: 18, borderRadius: 16, cursor: 'pointer',
                  border: `2px solid ${isSelected ? '#3B82F6' : '#F1F5F9'}`,
                  background: isSelected ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'white',
                  boxShadow: isSelected ? '0 4px 16px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px', color: '#1a1a2e', fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.program}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>{p.full_name}</p>
                    </div>
                    {isSelected && (
                      <span style={{ background: '#2563EB', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, marginLeft: 8, whiteSpace: 'nowrap' }}>
                        ✓ Selected
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748B' }}>
                    📍 {p.city}, {p.country}
                  </p>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 8 }}>
                      ⏱️ {p.duration_years}yr
                    </span>
                    <span style={{ fontSize: 11, background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 8 }}>
                      🌐 {p.language}
                    </span>
                    <span style={{ fontSize: 11, background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: 8 }}>
                      💰 ${p.tuition_usd?.toLocaleString()}/yr
                    </span>
                    {p.grant_available ? (
                      <span style={{ fontSize: 11, background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: 8 }}>✅ Grant</span>
                    ) : null}
                  </div>

                  {/* Entrance exam */}
                  {p.entrance_exam && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, background: '#F5F3FF', color: '#6D28D9', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>
                        📝 {p.entrance_exam}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p>No programs found. Try changing your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}