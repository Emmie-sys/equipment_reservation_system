import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Laptop, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('emmie');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login credentials incorrect or account inactive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('emmie');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo and Brand Header */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Laptop size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">EquipReserve</h2>
            <p className="text-xs text-slate-400">Institutional Portal</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Sign in to your account</h3>
        <p className="text-xs text-slate-400 mb-6">
          Access campus hardware, research instrumentation, and book reservations.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Campus Email</label>
            <div className="relative">
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full justify-center py-2.5"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demo Accounts (Click to test)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@school.edu')}
              className="p-2 rounded bg-slate-900/60 hover:bg-indigo-900/20 border border-slate-800 text-left transition"
            >
              <div className="font-semibold text-white">Admin</div>
              <div className="text-[10px] text-slate-400">admin@school.edu</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alex.rivera@student.school.edu')}
              className="p-2 rounded bg-slate-900/60 hover:bg-indigo-900/20 border border-slate-800 text-left transition"
            >
              <div className="font-semibold text-white">Student</div>
              <div className="text-[10px] text-slate-400">alex.rivera@student.school.edu</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
