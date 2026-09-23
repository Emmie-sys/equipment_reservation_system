import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  CalendarCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Search,
  Box,
  Layers,
  Wrench,
  TrendingUp,
  Calendar,
  LogIn,
  LogOut,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { useAuthContext } from '../../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_BADGE_MAP = {
  approved: 'badge badge-approved',
  pending: 'badge badge-pending',
  rejected: 'badge badge-rejected',
  active: 'badge badge-active',
  cancelled: 'badge badge-cancelled',
  completed: 'badge badge-completed',
};

function getStatusBadgeClass(statusName) {
  return STATUS_BADGE_MAP[statusName] || 'badge badge-pending';
}

export default function DashboardView() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Could not load dashboard data. Verify the backend is running.');
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const isAdmin = user?.roles?.some((r) => ['ADMIN', 'STAFF', 'TECHNICIAN'].includes(r));

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.25)',
        }}
      >
        <div className="card-body flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1">
              Welcome back, {user?.first_name || 'Faculty & Staff Member'}
            </h1>
            <p className="text-sm text-slate-400">
              Institutional Equipment Reservation Portal — reserve audiovisual, computing, and laboratory instruments seamlessly.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/catalog" className="btn btn-secondary">
              <Search size={16} />
              Browse Catalog
            </Link>
            <Link to="/reservations" className="btn btn-primary">
              <PlusCircle size={16} />
              My Reservations
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="card"
          style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' }}
        >
          <div className="card-body text-sm text-red-400">{error}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-icon accent">
            <Box size={22} className="text-indigo-400" />
          </div>
          <div className="stat-value">{isLoading ? '...' : (stats?.total_equipment ?? 0)}</div>
          <div className="stat-label">Total Catalog Units</div>
          <div className="stat-trend up">Institutional inventory tracked</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon success">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <div className="stat-value">{isLoading ? '...' : (stats?.available_equipment ?? 0)}</div>
          <div className="stat-label">Units Available Now</div>
          <div className="stat-trend up">Ready for instant checkout</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon warning">
            <Clock size={22} className="text-amber-400" />
          </div>
          <div className="stat-value">{isLoading ? '...' : (stats?.pending_reservations ?? 0)}</div>
          <div className="stat-label">Pending Approval</div>
          <div className="stat-trend">Awaiting staff review</div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon accent">
            <CalendarCheck size={22} className="text-cyan-400" />
          </div>
          <div className="stat-value">{isLoading ? '...' : (stats?.active_reservations ?? 0)}</div>
          <div className="stat-label">Active / Scheduled</div>
          <div className="stat-trend">Currently checked out or scheduled</div>
        </div>
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="card"
          style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(234,179,8,0.12)',
              border: '1px solid rgba(234,179,8,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wrench size={18} className="text-yellow-400" />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.4rem', marginBottom: 0 }}>
              {isLoading ? '...' : (stats?.in_maintenance ?? 0)}
            </div>
            <div className="stat-label" style={{ marginTop: 0 }}>In Maintenance</div>
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={18} className="text-indigo-400" />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.4rem', marginBottom: 0 }}>
              {isLoading ? '...' : (stats?.reservations_today ?? 0)}
            </div>
            <div className="stat-label" style={{ marginTop: 0 }}>Reservations Today</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Recent Reservations */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <CalendarCheck size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Recent Reservations</h3>
            </div>
            <Link
              to="/reservations"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment Item</th>
                  <th>Requester</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500 text-sm">
                      Loading reservations...
                    </td>
                  </tr>
                ) : !stats?.recent_bookings || stats.recent_bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500 text-sm">
                      No reservations recorded yet.
                    </td>
                  </tr>
                ) : (
                  stats.recent_bookings.map((res) => (
                    <tr key={res.reservation_id}>
                      <td className="font-mono text-xs text-slate-400">#{res.reservation_id}</td>
                      <td>
                        <div className="font-semibold text-white text-xs">
                          {res.model_name || 'Standard Equipment'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Tag: {res.asset_tag || 'Unassigned'}
                        </div>
                      </td>
                      <td className="text-xs">
                        {res.first_name} {res.last_name}
                      </td>
                      <td className="text-xs text-slate-300">
                        {formatDate(res.requested_start_datetime)} -{' '}
                        {formatDate(res.requested_end_datetime)}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(res.status_name)}>
                          {res.status_name || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Popular Equipment */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Popular Equipment</h3>
            </div>
            <Link
              to="/catalog"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              Browse <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-500 text-sm">Loading inventory...</div>
            ) : !stats?.popular_equipment || stats.popular_equipment.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No reservation data yet.
              </div>
            ) : (
              stats.popular_equipment.map((equip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {equip.model_name || equip.asset_tag}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {equip.manufacturer || 'Department Asset'}
                      </div>
                    </div>
                  </div>
                  <span
                    className="badge badge-approved"
                    style={{ fontSize: '10px', minWidth: 28, textAlign: 'center' }}
                  >
                    {equip.reservation_count}x
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              <h3 className="text-base font-bold text-white">Quick Actions</h3>
            </div>
          </div>
          <div className="card-body flex flex-wrap gap-3">
            <Link to="/reservations?filter=pending" className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Clock size={14} />
              Review Pending ({stats?.pending_reservations ?? 0})
            </Link>
            <Link to="/catalog" className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <Box size={14} />
              Equipment Catalog
            </Link>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '13px', opacity: 0.6, cursor: 'not-allowed' }}
              title="Check-in / Check-out is accessible from the Reservations page"
            >
              <LogIn size={14} />
              Check-In Equipment
            </button>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '13px', opacity: 0.6, cursor: 'not-allowed' }}
              title="Check-in / Check-out is accessible from the Reservations page"
            >
              <LogOut size={14} />
              Process Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
