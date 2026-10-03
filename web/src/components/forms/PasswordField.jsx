import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

/**
 * PasswordField
 * Password input with show/hide visibility toggle and lock iconography.
 */
export default function PasswordField({
  label = 'Password',
  error,
  id,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || 'password-input';

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Lock
          size={18}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className="form-input"
          style={{
            paddingLeft: '2.5rem',
            paddingRight: '2.5rem',
            borderColor: error ? 'var(--status-rejected-border)' : undefined,
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '0.65rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--status-rejected-text)', fontWeight: 500, marginTop: '0.2rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
