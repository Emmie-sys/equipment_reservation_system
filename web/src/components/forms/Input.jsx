import React from 'react';

/**
 * Input
 * Form input field with label, icon, and error validation states.
 */
export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
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
        )}
        <input
          id={inputId}
          type={type}
          className="form-input"
          style={{
            paddingLeft: Icon ? '2.5rem' : '0.95rem',
            borderColor: error ? 'var(--status-rejected-border)' : undefined,
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--status-rejected-text)', fontWeight: 500, marginTop: '0.2rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
