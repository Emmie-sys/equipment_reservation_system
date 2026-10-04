import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Clock,
  Wrench,
  Boxes,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Filter,
  Check,
  X,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import LineChart from '../../components/charts/LineChart';
import DonutChart from '../../components/charts/DonutChart';
import { dashboardApi } from '../../api/dashboard';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [selectedRes, setSelectedRes] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, resRes] = await Promise.all([
        dashboardApi.getStats(),
        reservationApi.getAll(),
      ]);
      setStats(statsRes.data);
      setReservations(resRes.data || []);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (resId) => {
    try {
      setIsProcessing(true);
      await reservationApi.approve(resId, 'Approved by Institutional Administrator.');
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRes) return;
    try {
      setIsProcessing(true);
      await reservationApi.reject(selectedRes.reservation_id, rejectReason || 'Administrative decision.');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedRes(null);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Rejection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const tableColumns = [
    {
      key: 'reservation_id',
      header: 'ID',
      headerStyle: { width: '80px' },
      render: (id) => <span className="font-mono text-xs">#{id}</span>,
    },
    {
      key: 'items',
      header: 'Requested Asset',
      render: (_, row) => {
        const item = row.items?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {item?.model?.model_name || 'Department Equipment'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Tag: {item?.equipment?.asset_tag || 'Pending Assignment'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (req) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.825rem' }}>
            {req?.first_name} {req?.last_name}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{req?.email}</div>
        </div>
      ),
    },
    {
      key: 'requested_start_datetime',
      header: 'Loan Window',
      render: (start, row) => (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          {start ? new Date(start).toLocaleDateString() : 'N/A'} —{' '}
          {row.requested_end_datetime ? new Date(row.requested_end_datetime).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (st) => <StatusBadge status={st?.status_name || 'pending'} />,
    },
    {
      key: 'actions',
      header: 'Governance',
      sortable: false,
      render: (_, row) => {
        const isPending = row.status?.status_name === 'pending';
        if (!isPending) return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decided</span>;
        return (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => handleApprove(row.reservation_id)}
              disabled={isProcessing}
              className="btn btn-primary btn-sm"
              title="Approve Reservation"
              style={{ padding: '0.25rem 0.55rem' }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setSelectedRes(row);
                setRejectModalOpen(true);
              }}
              disabled={isProcessing}
              className="btn btn-danger btn-sm"
              title="Reject Reservation"
              style={{ padding: '0.25rem 0.55rem' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const utilizationData = [
    { label: 'Available', value: stats?.available_equipment ?? 114, color: '#006B65' },
    { label: 'Active Loans', value: stats?.active_reservations ?? 28, color: '#38bdf8' },
    { label: 'Maintenance', value: stats?.in_maintenance ?? 6, color: '#F26419' },
  ];

  const activityData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 24 },
    { label: 'Wed', value: 19 },
    { label: 'Thu', value: 32 },
    { label: 'Fri', value: 45 },
    { label: 'Sat', value: 20 },
    { label: 'Sun', value: 28 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Contextual Greeting Banner */}
      <GlassCard
        padding="1.75rem 2rem"
        style={{
          background: 'var(--glass-surface-primary)',
          borderColor: 'var(--glass-border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">Institutional Administration</span>
              <span className="badge badge-available">PostgreSQL Online</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Good morning, {user?.first_name || 'Dr. Vance'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              System-wide equipment governance, fleet availability, and operational queue oversight.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn btn-secondary">
              <Boxes size={16} />
              Manage Catalog
            </Link>
            <Link to="/reservations" className="btn btn-primary">
              <CalendarCheck size={16} />
              Review All Bookings
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Action Error Notification */}
      {actionError && (
        <div
          className="glass-card"
          style={{
            borderColor: 'var(--status-rejected-border)',
            background: 'var(--status-rejected-bg)',
            color: 'var(--status-rejected-text)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI StatCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Total Catalog Units"
          value={isLoading ? '...' : (stats?.total_equipment ?? 148)}
          icon={Laptop}
          trend="+8 this quarter"
          trendType="up"
          colorVariant="emerald"
          sparklineData={[130, 134, 138, 142, 148]}
        />
        <StatCard
          label="Units Available Now"
          value={isLoading ? '...' : (stats?.available_equipment ?? 114)}
          icon={CheckCircle2}
          trend="77% fleet ready"
          trendType="up"
          colorVariant="plum"
          sparklineData={[98, 105, 110, 114]}
        />
        <StatCard
          label="Pending Review"
          value={isLoading ? '...' : (stats?.pending_reservations ?? 7)}
          icon={Clock}
          trend="Requires authorization"
          trendType="warning"
          colorVariant="plum"
          sparklineData={[3, 5, 8, 7]}
        />
        <StatCard
          label="Units in Maintenance"
          value={isLoading ? '...' : (stats?.in_maintenance ?? 3)}
          icon={Wrench}
          trend="Calibrations in progress"
          trendType="neutral"
          colorVariant="neutral"
          sparklineData={[2, 4, 3, 3]}
        />
      </div>

      {/* 2-Column Analytics & Queue Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Active Reservations Queue */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Reservation Requests</h3>
            <Link to="/reservations" className="text-brand" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Complete Ledger <ArrowRight size={14} />
            </Link>
          </div>

          <DataTable
            columns={tableColumns}
            data={reservations}
            isLoading={isLoading}
            searchPlaceholder="Filter reservation ID, asset tag or faculty..."
            pageSize={6}
          />
        </div>

        {/* Right: Fleet Health & Weekly Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Fleet Availability Distribution</h4>
            <DonutChart data={utilizationData} centerValue="92%" centerLabel="Fleet Health" />
          </GlassCard>

          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '0.75rem' }}>Weekly Reservation Velocity</h4>
            <LineChart data={activityData} height={160} strokeColor="#006B65" />
          </GlassCard>
        </div>
      </div>

      {/* Rejection Modal */}
      <GlassModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Equipment Reservation"
        subtitle={`Reservation #${selectedRes?.reservation_id} for ${selectedRes?.requester?.first_name} ${selectedRes?.requester?.last_name}`}
        footer={
          <>
            <button onClick={() => setRejectModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleReject} disabled={isProcessing} className="btn btn-danger">
              {isProcessing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Reason for Rejection</label>
          <textarea
            rows="3"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Conflicting high-priority laboratory session or missing faculty safety certification."
            className="form-textarea"
          />
        </div>
      </GlassModal>
    </div>
  );
}
