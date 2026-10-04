import React from 'react';

/**
 * BarChart
 * Clean, Apple-style SVG bar chart with rounded bars and hover feedback.
 */
export default function BarChart({
  data = [],
  xKey = 'label',
  yKey = 'value',
  height = 200,
  barColor = '#006B65',
  className = '',
}) {
  if (!data || data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No chart data</div>;
  }

  const values = data.map((d) => d[yKey] || 0);
  const max = Math.max(...values, 1);
  const width = 600;
  const paddingX = 24;
  const paddingY = 24;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const barWidth = Math.min(36, chartWidth / data.length - 12);

  return (
    <div className={className} style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height, overflow: 'visible' }}
      >
        {/* Background grid */}
        {[0.25, 0.5, 0.75].map((pct, idx) => {
          const y = height - paddingY - pct * chartHeight;
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

        {/* Bars */}
        {data.map((d, i) => {
          const slotWidth = chartWidth / data.length;
          const x = paddingX + i * slotWidth + (slotWidth - barWidth) / 2;
          const barH = (d[yKey] / max) * chartHeight;
          const y = height - paddingY - barH;

          return (
            <g key={i} className="bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={6}
                fill={d.color || barColor}
                opacity={0.88}
                style={{
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                }}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="600"
              >
                {d[yKey]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* X Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '0.4rem',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
        }}
      >
        {data.map((d, i) => (
          <span key={i} style={{ textAlign: 'center' }}>
            {d[xKey]}
          </span>
        ))}
      </div>
    </div>
  );
}
