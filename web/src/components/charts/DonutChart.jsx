import React from 'react';

/**
 * DonutChart
 * Apple-style SVG donut chart with center statistic readout and breakdown chips.
 */
export default function DonutChart({
  data = [], // [{ label: 'Active', value: 77, color: '#1B6A41' }, ...]
  centerLabel = 'Utilization',
  centerValue = '92%',
  size = 190,
  strokeWidth = 22,
  className = '',
}) {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Base background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--glass-surface-secondary)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((slice, idx) => {
            const percent = slice.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease',
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </svg>

        {/* Center Readout */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {centerValue}
          </span>
          <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: 'var(--glass-surface-secondary)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--glass-border-subtle)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: d.color,
              }}
            />
            <span>{d.label}</span>
            <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
