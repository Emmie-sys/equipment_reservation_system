import React from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { 
  Laptop, 
  LayoutDashboard, 
  CalendarCheck, 
  LogOut, 
  Boxes,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function Layout({ children }) {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthContext();

  // If on login page, don't show the sidebar layout
  if (location.pathname === '/login' || !isAuthenticated) {
    return <main>{children}</main>;
  }

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/catalog', label: 'Equipment Catalog', icon: <Boxes size={18} /> },
    { to: '/reservations', label: 'Reservations', icon: <CalendarCheck size={18} /> },
  ];

  const userRoles = user?.roles || [];
  const primaryRole = userRoles[0] || 'CAMPUS_MEMBER';
  const displayName = user?.display_name || `${user?.first_name || 'Campus'} ${user?.last_name || 'User'}`;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Laptop size={22} className="text-white" />
          </div>
          <div>
            <div className="sidebar-logo-text">EquipReserve</div>
            <div className="sidebar-logo-sub">Institutional Systems</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Operations</div>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-item-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="nav-section-label">System Info</div>
          <div className="px-3 py-2 text-[11px] text-slate-500">
            <div>PostgreSQL 16 DB: <strong>Online</strong></div>
            <div>Conflict Engine: <strong>Active</strong></div>
          </div>
        </nav>

        {/* User Status in Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-pill flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="user-avatar">
                {displayName.charAt(0)}
              </div>
              <div className="truncate">
                <div className="user-name truncate">{displayName}</div>
                <div className="user-role flex items-center gap-1">
                  <ShieldCheck size={12} className="text-indigo-400" />
                  {primaryRole}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-title">
            <h2>Campus Equipment Reservation & Tracking</h2>
            <p>Unified catalog and reservation management</p>
          </div>
          <div className="topbar-actions">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-semibold">
              Spring 2026 Term
            </span>
          </div>
        </header>

        <div className="page-body">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
