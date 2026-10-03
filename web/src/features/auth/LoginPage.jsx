import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Wrench,
  UserCheck,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import PasswordField from '../../components/forms/PasswordField';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('emmie');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid institutional credentials or deactivated account.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'ADMIN',
      title: 'Administrator',
      email: 'admin@school.edu',
      desc: 'Institutional Oversight',
      icon: ShieldCheck,
      color: '#22c55e',
    },
    {
      role: 'TECHNICIAN',
      title: 'Lab Technician',
      email: 'r.miller@school.edu',
      desc: 'Dispatch & Repairs',
      icon: Wrench,
      color: '#38bdf8',
    },
    {
      role: 'STAFF',
      title: 'Academic Faculty',
      email: 's.jenkins@school.edu',
      desc: 'Coursework Bookings',
      icon: UserCheck,
      color: '#c084fc',
    },
    {
      role: 'STUDENT',
      title: 'Student Member',
      email: 'alex.rivera@student.school.edu',
      desc: 'Self-Service Loans',
      icon: GraduationCap,
      color: '#f59e0b',
    },
  ];

  const handleQuickFill = (accEmail) => {
    setEmail(accEmail);
    setPassword('emmie');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        background: 'var(--canvas-bg)',
        backgroundImage: 'var(--canvas-ambient)',
      }}
    >
      {/* Top right theme toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 0.8rem' }}
          title="Toggle Light / Dark mode"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: 'var(--glass-shadow-lg), 0 0 0 1px var(--glass-border-strong)',
        }}
      >
        {/* Left Side: Branded Visual Experience */}
        <div
          style={{
            background: '#09381F',
            borderRight: '1px solid rgba(230, 212, 230, 0.15)',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            color: '#FAF8FB',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20"
                    stroke="#FAF8FB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 12L11 15L17 9"
                    stroke="#E6D4E6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="1.5" fill="#34D399" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#FAF8FB' }}>
                  RESERV<span style={{ color: '#E6D4E6' }}>iT</span>
                </h2>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(230, 212, 230, 0.85)', fontWeight: 600 }}>
                  Equipment Reservation System
                </p>
              </div>
            </div>

            <h1 style={{ fontSize: '1.95rem', fontWeight: 800, lineHeight: 1.25, color: '#FAF8FB', marginBottom: '1rem' }}>
              Precision hardware access for academic excellence.
            </h1>
            <p style={{ fontSize: '0.925rem', color: 'rgba(250, 248, 251, 0.82)', lineHeight: 1.6 }}>
              Reserve audiovisual assets, laboratory engineering equipment, high-performance workstations, and studio production gear with real-time conflict checking.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: 'rgba(250, 248, 251, 0.9)' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Automated conflict avoidance & scheduling</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: 'rgba(250, 248, 251, 0.9)' }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>Role-governed approval and dispatch workflows</span>
            </div>
          </div>
        </div>

        {/* Right Side: Frosted Glass Login Panel */}
        <div
          className="glass-card"
          style={{
            borderRadius: 0,
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'var(--glass-surface-primary)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Institutional Sign In
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your university credentials to access your portal.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group">
              <label className="form-label">Campus Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <PasswordField
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Authenticating session...' : 'Sign In to Portal'}
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Role Fillers */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Demo Personas (Click to test role)
              </span>
              <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>
                Password: emmie
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className="glass-panel"
                    style={{
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--brand-forest-vivid)' : '1px solid var(--glass-border-subtle)',
                      background: isSelected ? 'var(--brand-forest-dim)' : 'var(--glass-surface-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <Icon size={14} color={acc.color} />
                      <strong style={{ fontSize: '0.775rem', color: 'var(--text-primary)' }}>{acc.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }} className="truncate">
                      {acc.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
