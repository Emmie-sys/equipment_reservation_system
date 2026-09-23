import React from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuthContext();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/incidents', label: 'Incidents' },
    { to: '/sanctions', label: 'Sanctions' },
    { to: '/students', label: 'Students' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg">
              SD
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">DisciplineHub</div>
              <div className="text-xs text-slate-400">Institutional Portal</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/80 rounded-xl flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Dr. Vance (Dean)'}</div>
            <div className="text-xs text-slate-400 truncate">{user?.role || 'DISCIPLINARY_OFFICER'}</div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-rose-400 hover:text-rose-300 ml-2"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
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
