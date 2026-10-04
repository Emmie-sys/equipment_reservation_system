import React from 'react';
import GlassCard from '../glass/GlassCard';

/**
 * StatCard
 * Apple-inspired KPI metric card with telemetry sparkline and trend indicator.
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'up' | 'down' | 'neutral' | 'warning'
  colorVariant = 'emerald', // 'emerald' | 'plum' | 'amber' | 'cyan'
  sparklineData,
  className = '',
  onClick,
}) {
  const iconVariantClass = {
    emerald: 'stat-icon-emerald',
    forest: 'stat-icon-forest',
    plum: 'stat-icon-plum',
    lilac: 'stat-icon-lilac',
    neutral: 'stat-icon-neutral',
    brand: 'stat-icon-emerald',
    amber: 'stat-icon-amber',
    cyan: 'stat-icon-cyan',
  }[colorVariant] || 'stat-icon-emerald';

  // Explicit icon colors — prevents invisible icons when CSS inheritance breaks
  const iconColor = {
    emerald: '#5EC4BE',
    forest: '#5EC4BE',
    teal: '#5EC4BE',
    plum: '#F47D3E',
    lilac: '#F47D3E',
    orange: '#F26419',
    neutral: '#CBD5E1',
    brand: '#5EC4BE',
    amber: '#FCD34D',
    cyan: '#67E8F9',
  }[colorVariant] || '#5EC4BE';

  const sparklineStroke = {
    emerald: '#5EC4BE',
    forest: '#5EC4BE',
    teal: '#5EC4BE',
    plum: '#F47D3E',
    lilac: '#F47D3E',
    orange: '#F26419',
    neutral: '#CBD5E1',
    brand: '#5EC4BE',
    amber: '#fbbf24',
    cyan: '#5EC4BE',
  }[colorVariant] || '#5EC4BE';

  // Render a mini SVG sparkline if data array provided
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = sparklineData.map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((d - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '84px', height: '26px', overflow: 'visible', opacity: 0.85 }}
      >
        <polyline
          fill="none"
          stroke={sparklineStroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <GlassCard
      interactive={!!onClick}
      onClick={onClick}
      className={`stat-card ${className}`}
      padding="1.25rem 1.35rem"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${iconVariantClass}`}>
            <Icon size={20} color={iconColor} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-value">{value}</div>
          {trend && (
            <div className="stat-footer">
              <span
                style={{
                  color:
                    trendType === 'up'
                      ? 'var(--status-available-text)'
                      : trendType === 'warning'
                      ? 'var(--status-pending-text)'
                      : trendType === 'down'
                      ? 'var(--status-rejected-text)'
                      : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        {renderSparkline()}
      </div>
    </GlassCard>
  );
}
