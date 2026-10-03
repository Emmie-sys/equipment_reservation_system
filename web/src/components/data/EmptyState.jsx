import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState
 * Apple-grade empty state with glass framing, iconography, and clear recovery action.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display in this category right now.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--brand-forest-dim)',
          border: '1px solid var(--glass-border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-forest-vivid)',
          marginBottom: '1rem',
          boxShadow: 'var(--glass-highlight-soft)',
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: actionLabel ? '1.25rem' : 0 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-secondary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
