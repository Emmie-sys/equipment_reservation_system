import React from 'react';

/**
 * SkeletonLoader
 * Shimmering glass skeleton placeholder to eliminate layout shift during async data fetch.
 */
export function Skeleton({ width = '100%', height = '1.25rem', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.35rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <Skeleton width="45%" height="14px" />
        <Skeleton width="38px" height="38px" borderRadius="var(--radius-md)" />
      </div>
      <Skeleton width="60%" height="28px" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="35%" height="12px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-container" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="18px" style={{ flex: 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', marginBottom: '0.9rem' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="22px" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
