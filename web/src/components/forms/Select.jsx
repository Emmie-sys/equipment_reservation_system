import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select
 * Custom styled select field with chevron and options.
 */
export default function Select({
  label,
  options = [], // [{ value: '...', label: '...' }]
  error,
  id,
  className = '',
  ...props
}) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          className="form-select"
          style={{
            appearance: 'none',
            paddingRight: '2.5rem',
            borderColor: error ? 'var(--status-rejected-border)' : undefined,
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
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
