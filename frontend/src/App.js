import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Roadmap from './pages/Roadmap';
import Programs from './pages/Programs';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #F0F4FA;
            color: #1a1a2e;
            min-height: 100vh;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
          input, select, textarea, button { font-family: 'Plus Jakarta Sans', sans-serif; }
          a { text-decoration: none; }
        `}</style>
        <Navbar />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
            <Route path="/roadmap" element={<PrivateRoute><Roadmap /></PrivateRoute>} />
            <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}