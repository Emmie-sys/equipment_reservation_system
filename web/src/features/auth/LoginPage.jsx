import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import PasswordField from '../../components/forms/PasswordField';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--canvas-bg)',
        backgroundImage: 'var(--canvas-ambient)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          border: '1px solid var(--glass-border-medium)',
          boxShadow: 'var(--glass-shadow-xl)',
        }}
      >
        {/* Left — Brand panel */}
        <div
          style={{
            background: '#008080',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#FFFAFA',
          }}
        >
          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.75rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="#FAF8FB" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M8 12L11 15L17 9" stroke="#FFFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1.5" fill="#F26419" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                  RESERV<span style={{ color: '#F26419' }}>iT</span>
                </div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,250,250,0.75)', fontWeight: 600 }}>
                  Campus Equipment
                </div>
              </div>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.85rem', color: '#FFFAFA' }}>
              Reserve the right learning aid, right when you need it.
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(250,248,251,0.78)', lineHeight: 1.65 }}>
              AV equipment, lab hardware, workstations and studio gear — all in one place.
            </p>
          </div>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '2.5rem' }}>
            {['Real-time availability & conflict checking', 'Role-based approval & dispatch workflows'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.825rem', color: 'rgba(255,250,250,0.9)' }}>
                <CheckCircle2 size={15} color="#F26419" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form panel */}
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
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem' }}>Continue with SSO</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Use your university email or student ID.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Email or Student Number</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gu.ac.ug"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="email"
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
              style={{ width: '100%', marginTop: '0.4rem' }}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--glass-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
            }}
          >
            <ShieldCheck size={14} color="var(--brand-teal-vivid)" style={{ flexShrink: 0 }} />
            <span>Secured via institutional SSO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
