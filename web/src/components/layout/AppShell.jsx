import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  CalendarCheck,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Wrench,
  GraduationCap,
  Sparkles,
  UserCircle2,
  Bell,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page or not authenticated, render pure children
  if (location.pathname === '/login' || !isAuthenticated) {
    return <main>{children}</main>;
  }

  const userRoles = user?.roles || [];
  const primaryRole = userRoles[0] || 'STUDENT';
  const displayName = user?.display_name || `${user?.first_name || 'Campus'} ${user?.last_name || 'User'}`;

  // Role icon and badge color
  const roleConfig = {
    ADMIN: { label: 'Administrator', icon: ShieldCheck, color: '#22c55e' },
    TECHNICIAN: { label: 'Lab Technician', icon: Wrench, color: '#38bdf8' },
    STAFF: { label: 'Academic Faculty', icon: UserCheck, color: '#c084fc' },
    STUDENT: { label: 'Student Member', icon: GraduationCap, color: '#f59e0b' },
  }[primaryRole] || { label: primaryRole, icon: ShieldCheck, color: '#22c55e' };

  const RoleIcon = roleConfig.icon;

  // Role-aware navigation links
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/catalog', label: 'Equipment Catalog', icon: Boxes },
    { to: '/reservations', label: 'Reservations', icon: CalendarCheck },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Profile', icon: UserCircle2 },
    { to: '/styleguide', label: 'Design System', icon: Palette },
  ];

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-nav-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="sidebar-brand"
            title="RESERViT — Campus Equipment Platform"
          >
            {/* Integrated Logo Glyph */}
            <div className="brand-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20"
                  stroke="#FAF8FB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12L11 15L17 9"
                  stroke="#F0EDE5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="1.5" fill="#F26419" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="brand-text-container">
                <span className="brand-name">
                  RESERV<span className="brand-name-highlight">iT</span>
                </span>
                <span className="brand-sub">Campus Logistics</span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '0.35rem' }} // hidden on mobile, shown via media query or button
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">{!isCollapsed ? 'Operations' : '•••'}</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            const isNotif = item.to === '/notifications';
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                style={{ position: 'relative' }}
              >
                <div className="nav-link-icon" style={{ position: 'relative' }}>
                  <Icon size={19} />
                  {isNotif && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 14, height: 14, borderRadius: '50%',
                      background: 'var(--brand-teal-vivid)', color: 'var(--brand-cream-base)',
                      fontSize: '0.55rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--canvas-bg)',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    {item.label}
                    {isNotif && unreadCount > 0 && (
                      <span style={{
                        background: 'var(--brand-teal-dim)',
                        color: 'var(--brand-teal-vivid)',
                        border: '1px solid var(--glass-border-medium)',
                        fontSize: '0.62rem', fontWeight: 800,
                        padding: '1px 6px', borderRadius: 999,
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}


          {!isCollapsed && (
            <div style={{ marginTop: 'auto', padding: '0.75rem 0.5rem' }}>
              <div
                className="glass-panel"
                style={{
                  padding: '0.85rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-teal-vivid)', fontWeight: 700 }}>
                  <Sparkles size={14} />
                  <span>Institutional Cloud</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  PostgreSQL 16 Engine: <strong style={{ color: '#22c55e' }}>Online</strong>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer with User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--brand-teal-mid)',
                  border: '1px solid rgba(240, 237, 229, 0.22)',
                  color: 'var(--brand-cream-base)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--glass-highlight-soft)',
                }}
              >
                {displayName.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                    {displayName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: roleConfig.color, fontWeight: 600 }}>
                    <RoleIcon size={12} />
                    <span>{roleConfig.label}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className={`app-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sticky Glass Topbar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.4rem' }}
              aria-label="Open mobile navigation"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                RESERViT <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• Institutional Portal</span>
                <span className="live-indicator" title="System online" />
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification Bell */}
            <button
              id="topbar-notifications-btn"
              onClick={() => navigate('/notifications')}
              title="Notifications"
              aria-label="View notifications"
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: 'var(--brand-teal-vivid)',
                    color: 'var(--brand-cream-base)',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                    border: '1.5px solid var(--canvas-bg)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', padding: '0.4rem 0.75rem' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--brand-teal-dim)',
                color: 'var(--brand-teal-vivid)',
                border: '1px solid var(--glass-border-medium)',
                fontWeight: 600,
              }}
            >
              Academic Year 2026
            </span>
          </div>
        </header>

        {/* Page Content View */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
