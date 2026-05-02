import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: isActive(path) ? '600' : '500',
    padding: '6px 12px',
    borderRadius: 8,
    background: isActive(path) ? 'rgba(255,255,255,0.15)' : 'transparent',
    transition: 'all 0.2s',
  });

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1a2744 0%, #1F4E79 100%)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(31,78,121,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16
        }}>🎓</div>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
          Roadmap<span style={{ color: '#60A5FA' }}>AI</span>
        </span>
      </Link>

      {/* Links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { path: '/dashboard', label: 'Dashboard' },
            { path: '/assessment', label: 'Assessment' },
            { path: '/roadmap', label: 'Roadmap' },
            { path: '/programs', label: 'Programs' },
            { path: '/chat', label: 'AI Advisor' },
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={linkStyle(path)}>{label}</Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', borderRadius: 20,
              padding: '5px 12px 5px 5px', color: 'white'
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white'
              }}>
                {user.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name?.split(' ')[0]}</span>
            </Link>
            <button onClick={handleLogout} style={{
              background: 'rgba(239,68,68,0.15)', color: '#FCA5A5',
              border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px',
              borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Login</Link>
            <Link to="/register" style={{
              background: '#3B82F6', color: 'white', padding: '7px 16px',
              borderRadius: 8, fontSize: 14, fontWeight: 600
            }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}