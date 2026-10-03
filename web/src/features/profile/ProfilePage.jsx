import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  Wrench,
  UserCheck,
  GraduationCap,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/glass/GlassCard';
import { authApi } from '../../api/auth';

const ROLE_CONFIG = {
  ADMIN: { label: 'Administrator', icon: ShieldCheck, color: '#22c55e', bg: 'rgba(22,163,74,0.12)' },
  TECHNICIAN: { label: 'Lab Technician', icon: Wrench, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  STAFF: { label: 'Academic Faculty', icon: UserCheck, color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  STUDENT: { label: 'Student Member', icon: GraduationCap, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

function Field({ label, value, icon }) {
  const Icon = icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.7rem 0.9rem',
        background: 'var(--glass-surface-secondary)',
        border: '1px solid var(--glass-border-subtle)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        fontWeight: 500,
      }}>
        {Icon && <Icon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthContext();

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [isPwLoading, setIsPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwError, setPwError] = useState(null);

  const displayName = user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const initials = displayName ? displayName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
  const primaryRole = user?.roles?.[0] || 'STUDENT';
  const roleConf = ROLE_CONFIG[primaryRole] || ROLE_CONFIG.STUDENT;
  const RoleIcon = roleConf.icon;

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsPwLoading(true);
      await authApi.changePassword({ current_password: pwForm.current, new_password: pwForm.next });
      setPwSuccess('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setIsPwLoading(false);
    }
  }

  function PwField({ id, label, field }) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={id}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input
            id={id}
            type={showPw[field] ? 'text' : 'password'}
            className="form-input"
            style={{ paddingRight: '2.5rem' }}
            value={pwForm[field]}
            onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={showPw[field] ? 'Hide password' : 'Show password'}
          >
            {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 720, margin: '0 auto' }}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          View your account details and manage security settings.
        </p>
      </div>

      {/* ── Identity Card ─────────────────────────────────────────────────── */}
      <GlassCard style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--brand-forest-dark)',
            border: '1px solid rgba(230, 212, 230, 0.28)',
            color: '#FAF8FB',
            fontWeight: 800,
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glass-shadow-md)',
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}>
            {initials}
          </div>

          {/* Name & Role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.2rem' }}>
              {displayName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: roleConf.bg, color: roleConf.color,
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem', fontWeight: 700,
                border: `1px solid ${roleConf.color}30`,
              }}>
                <RoleIcon size={12} />
                {roleConf.label}
              </span>
              {user?.roles?.slice(1).map((role) => {
                const c = ROLE_CONFIG[role];
                if (!c) return null;
                const ExtraIcon = c.icon;
                return (
                  <span key={role} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    background: c.bg, color: c.color,
                    padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${c.color}30`,
                  }}>
                    <ExtraIcon size={12} />
                    {c.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--glass-border-subtle)', margin: '1.5rem 0' }} />

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <Field label="First Name" value={user?.first_name} icon={User} />
          <Field label="Last Name" value={user?.last_name} icon={User} />
          <Field label="Email Address" value={user?.email} icon={Mail} />
          {user?.department && <Field label="Department" value={user.department} icon={Building2} />}
        </div>
      </GlassCard>

      {/* ── Change Password ───────────────────────────────────────────────── */}
      <GlassCard style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--brand-forest-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={17} style={{ color: 'var(--brand-forest-vivid)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 0 }}>Security — Change Password</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Use a strong password with at least 8 characters.
            </p>
          </div>
        </div>

        {pwSuccess && (
          <div className="alert-banner alert-banner-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={15} />
            <span>{pwSuccess}</span>
            <button onClick={() => setPwSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}>
              <X size={13} />
            </button>
          </div>
        )}
        {pwError && (
          <div className="alert-banner alert-banner-error" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={15} />
            <span>{pwError}</span>
            <button onClick={() => setPwError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}>
              <X size={13} />
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PwField id="current-pw" label="Current Password" field="current" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <PwField id="new-pw" label="New Password" field="next" />
            <PwField id="confirm-pw" label="Confirm New Password" field="confirm" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={isPwLoading}>
              <Save size={15} />
              {isPwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
