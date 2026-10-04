import React from 'react';

/**
 * GlassCard — Apple HIG Vibrancy System
 * Layered depth materials: card (L1) | panel (L2) | solid (L3) | elevated (L3+) | modal (L5)
 * Every surface gets the Apple specular top-edge highlight via ::before pseudo-element.
 */
export default function GlassCard({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'solid' | 'elevated' | 'modal'
  interactive = false,
  animate = true,       // entry animation
  padding = '1.5rem',
  style = {},
  ...props
}) {
  const variantClass = {
    primary: 'glass-card',
    secondary: 'glass-panel',
    solid: 'glass-solid',
    elevated: 'glass-card',    // glass-card with extra elevation via style
    modal: 'glass-modal',
    chrome: 'glass-chrome',
  }[variant] || 'glass-card';

  const elevatedStyle = variant === 'elevated'
    ? { boxShadow: 'var(--glass-shadow-xl), var(--glass-shadow-glow)' }
    : {};

  return (
    <div
      className={`${variantClass} ${interactive ? 'interactive' : ''} ${animate ? '' : 'no-anim'} ${className}`}
      style={{ padding, ...elevatedStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
