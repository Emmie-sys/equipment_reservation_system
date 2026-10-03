import React from 'react';

/**
 * LineChart
 * High-performance, zero-dependency SVG smooth spline line chart.
 */
export default function LineChart({
  data = [],
  xKey = 'label',
  yKey = 'value',
  height = 200,
  strokeColor = '#1B6A41',
  fillArea = true,
  fillGradient = true, // for backwards-compatibility
  className = '',
}) {
  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No chart data</div>;
  }

  const values = data.map((d) => d[yKey] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 600;
  const paddingY = 24;
  const paddingX = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d[yKey] - min) / range) * (height - paddingY * 2);
    return { x, y, label: d[xKey], value: d[yKey] };
  });

  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={className} style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height, overflow: 'visible' }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct, idx) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--glass-border-subtle)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area Fill - Solid with subtle opacity, zero gradients */}
        {fillGradient && <path d={areaD} fill={strokeColor} fillOpacity="0.12" />}

        {/* Spline Path */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-point">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="var(--glass-surface-solid)"
              stroke={strokeColor}
              strokeWidth="2.5"
            />
          </g>
        ))}
      </svg>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 0.5rem',
          marginTop: '0.4rem',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
        }}
      >
        {data.map((d, i) => (
          <span key={i}>{d[xKey]}</span>
        ))}
      </div>
    </div>
  );
}
