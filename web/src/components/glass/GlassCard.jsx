import React from 'react';

/**
 * GlassCard
 * Apple-grade frosted glass container with specular highlight and subtle depth.
 */
export default function GlassCard({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'solid'
  interactive = false,
  padding = '1.5rem',
  style = {},
  ...props
}) {
  const variantClass = {
    primary: 'glass-card',
    secondary: 'glass-panel',
    solid: 'glass-solid',
  }[variant] || 'glass-card';

  return (
    <div
      className={`${variantClass} ${interactive ? 'interactive' : ''} ${className}`}
      style={{ padding, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
