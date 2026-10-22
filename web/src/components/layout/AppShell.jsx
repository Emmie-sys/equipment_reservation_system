import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Boxes, CalendarCheck, LogOut,
  ChevronLeft, ChevronRight, Menu, ShieldCheck, UserCheck,
  Wrench, GraduationCap, Sparkles, UserCircle2, Bell,
  AlertTriangle, Users, MessageSquare, Lock, Settings,
  PackageSearch,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// ─── Role-specific navigation configurations ──────────────────────────────────

const NAV_CONFIGS = {
  STUDENT: {
    roleLabel: 'Class Representative',
    roleColor: '#f59e0b',
    RoleIcon: UserCheck,
    sections: [
      {
        label: 'My Portal',
        items: [
          { to: '/', label: 'Overview', icon: LayoutDashboard },
          { to: '/catalog', label: 'Equipment Catalog', icon: Boxes },
          { to: '/reservations', label: 'My Reservations', icon: CalendarCheck },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/profile', label: 'My Profile', icon: UserCircle2 },
        ],
      },
    ],
  },

  LECTURER: {
    roleLabel: 'Faculty Lecturer',
    roleColor: '#8b5cf6',
    RoleIcon: GraduationCap,
    sections: [
      {
        label: 'Academic Portal',
        items: [
          { to: '/', label: 'Overview', icon: LayoutDashboard },
          { to: '/catalog', label: 'Equipment Catalog', icon: Boxes },
          { to: '/reservations', label: 'My Reservations', icon: CalendarCheck },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/profile', label: 'My Profile', icon: UserCircle2 },
        ],
      },
    ],
  },

  ATTENDANT: {
    roleLabel: 'Equipment Attendant',
    roleColor: '#3b82f6',
    RoleIcon: Wrench,
    sections: [
      {
        label: 'Operations',
        items: [
          { to: '/', label: 'Dispatch Desk', icon: LayoutDashboard },
          { to: '/reservations', label: 'All Reservations', icon: CalendarCheck },
          { to: '/catalog', label: 'Full Inventory', icon: Boxes },
          { to: '/equipment/faulty', label: 'Faulty Equipment', icon: AlertTriangle },
        ],
      },
      {
        label: 'Directory',
        items: [
          { to: '/users', label: 'Manage Users', icon: Users },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/profile', label: 'My Profile', icon: UserCircle2 },
        ],
      },
    ],
  },

  ADMIN: {
    roleLabel: 'Institutional Admin',
    roleColor: '#008080',
    RoleIcon: ShieldCheck,
    sections: [
      {
        label: 'Operations',
        items: [
          { to: '/', label: 'Overview', icon: LayoutDashboard },
          { to: '/reservations', label: 'All Reservations', icon: CalendarCheck },
          { to: '/catalog', label: 'Full Inventory', icon: Boxes },
          { to: '/equipment/faulty', label: 'Faulty Equipment', icon: AlertTriangle },
        ],
      },
      {
        label: 'Administration',
        items: [
          { to: '/users', label: 'Manage Users', icon: Users },
          { to: '/messages', label: 'Messages', icon: MessageSquare },
          { to: '/roles', label: 'Role Management', icon: Lock },
          { to: '/settings', label: 'System Settings', icon: Settings },
          { to: '/profile', label: 'My Profile', icon: UserCircle2 },
        ],
      },
    ],
  },
};

// Fallbacks for legacy aliases
NAV_CONFIGS.TECHNICIAN = NAV_CONFIGS.ATTENDANT;
NAV_CONFIGS.STAFF = NAV_CONFIGS.LECTURER;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthContext();
  const { unreadCount } = useNotifications();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location.pathname === '/login' || !isAuthenticated) {
    return <main>{children}</main>;
  }

  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();
  const cleanRoleName = {
    ADMIN: 'ADMIN',
    ATTENDANT: 'ATTENDANT',
    TECHNICIAN: 'ATTENDANT',
    LECTURER: 'STAFF',
    STAFF: 'STAFF',
    STUDENT: 'STUDENT',
  }[primaryRole] || 'STUDENT';

  const navCfg = NAV_CONFIGS[primaryRole] || NAV_CONFIGS.STUDENT;
  const { RoleIcon, sections, roleLabel } = navCfg;
  const displayName = user?.display_name || `${user?.first_name || 'Campus'} ${user?.last_name || 'User'}`;

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      <div
        className={`mobile-nav-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-header">
          <Link to="/" onClick={() => setMobileOpen(false)} className="sidebar-brand" title="RESERViT — Campus Equipment Platform">
            <div className="brand-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" stroke="#FAF8FB" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8 12L11 15L17 9" stroke="#FFFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="1.5" fill="#F26419" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="brand-text-container">
                <span className="brand-name">RESERV<span className="brand-name-highlight">iT</span></span>
                <span className="brand-sub">Campus Logistics</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed((p) => !p)}
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '0.35rem' }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Badge: Centered, all white text, good padding, fully rounded white border */}
        {!isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.25rem 1rem 0.4rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem 0.8rem',
              borderRadius: '9999px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}>
                {cleanRoleName}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sections.map((section) =>
            <div key={section.label}>
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`nav-link-item ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="nav-link-icon">
                      <Icon size={19} />
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}

          {/* System Status Card */}
          {!isCollapsed && (
            <div style={{ marginTop: 'auto', padding: '0.75rem 0.5rem' }}>
              <div className="sidebar-status-card" style={{ padding: '0.85rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderRadius: 'var(--radius-md)' }}>
                <div className="status-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <Sparkles size={14} /> <span>Institutional Cloud</span>
                </div>
                <div className="status-card-sub">
                  PostgreSQL 16: <strong style={{ color: '#22c55e' }}>Online</strong>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer user widget */}
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div className="sidebar-user-avatar">{displayName.charAt(0)}</div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="sidebar-user-name truncate">{displayName}</div>
                </div>
              )}
            </div>
            <button onClick={logout} title="Sign Out" aria-label="Sign out" className="sidebar-logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`app-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="btn btn-ghost btn-sm mobile-menu-btn"
              style={{ padding: '0.4rem' }}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Notification Bell */}
            <button
              id="topbar-notifications-btn"
              onClick={() => navigate('/messages')}
              title="Messages & Notifications"
              aria-label="View messages"
              style={{ position: 'relative', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 999, background: 'var(--brand-orange)', color: '#FFFFFF', fontSize: '0.625rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', lineHeight: 1, border: '1.5px solid var(--canvas-bg)', boxShadow: '0 1px 3px rgba(0,0,0,0.20)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)', background: 'var(--brand-teal-dim)', color: 'var(--brand-teal-vivid)', border: '1px solid var(--glass-border-medium)', fontWeight: 600 }}>
              Academic Year 2026
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
