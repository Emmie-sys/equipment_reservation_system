import React from 'react';

/**
 * StatusBadge
 * Apple-inspired pill badge with glowing telemetry indicator dot.
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null;

  const rawStatus = String(status).toLowerCase().trim();

  // Mapping status to colors & classes
  const configMap = {
    // Equipment statuses
    available: { label: 'Available', class: 'badge-available', dot: '#22c55e' },
    reserved: { label: 'Reserved', class: 'badge-pending', dot: '#f59e0b' },
    checked_out: { label: 'Checked Out', class: 'badge-active', dot: '#38bdf8' },
    maintenance: { label: 'In Maintenance', class: 'badge-maintenance', dot: '#a78bfa' },
    retired: { label: 'Retired', class: 'badge-retired', dot: '#94a3b8' },

    // Reservation statuses
    pending: { label: 'Pending Review', class: 'badge-pending', dot: '#f59e0b' },
    approved: { label: 'Approved', class: 'badge-approved', dot: '#22c55e' },
    active: { label: 'Active Loan', class: 'badge-active', dot: '#38bdf8' },
    rejected: { label: 'Rejected', class: 'badge-rejected', dot: '#f43f5e' },
    cancelled: { label: 'Cancelled', class: 'badge-rejected', dot: '#f43f5e' },
    completed: { label: 'Returned / Closed', class: 'badge-completed', dot: '#94a3b8' },
  };

  const current = configMap[rawStatus] || {
    label: status,
    class: 'badge-brand',
    dot: '#006B65',
  };

  const sizeStyles = {
    sm: { padding: '0.2rem 0.5rem', fontSize: '0.7rem' },
    md: { padding: '0.28rem 0.7rem', fontSize: '0.75rem' },
    lg: { padding: '0.35rem 0.9rem', fontSize: '0.85rem' },
  }[size] || { padding: '0.28rem 0.7rem', fontSize: '0.75rem' };

  return (
    <span
      className={`badge ${current.class} ${className}`}
      style={{ ...sizeStyles, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: current.dot,
          boxShadow: `0 0 6px ${current.dot}`,
          flexShrink: 0,
        }}
      />
      <span>{current.label}</span>
    </span>
  );
}
