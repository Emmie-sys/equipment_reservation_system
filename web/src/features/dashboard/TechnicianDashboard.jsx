import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  LogIn,
  LogOut,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Barcode,
  Search,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import { dashboardApi } from '../../api/dashboard';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

export default function TechnicianDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: 'checkout', res: null });
  const [conditionNotes, setConditionNotes] = useState('');
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
      console.error('Failed to load technician telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckout = async () => {
    if (!actionModal.res) return;
    try {
      setIsProcessing(true);
      await reservationApi.checkout(actionModal.res.reservation_id, conditionNotes, 'Checked out at dispatch desk');
      setActionModal({ isOpen: false, type: 'checkout', res: null });
      setConditionNotes('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckin = async () => {
    if (!actionModal.res) return;
    try {
      setIsProcessing(true);
      await reservationApi.checkin(actionModal.res.reservation_id, conditionNotes || 'Returned in good operational condition');
      setActionModal({ isOpen: false, type: 'checkin', res: null });
      setConditionNotes('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Checkin failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const dispatchColumns = [
    {
      key: 'reservation_id',
      header: 'ID',
      headerStyle: { width: '80px' },
      render: (id) => <span className="font-mono text-xs">#{id}</span>,
    },
    {
      key: 'items',
      header: 'Equipment Asset & Tag',
      render: (_, row) => {
        const item = row.items?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {item?.model?.model_name || 'Standard Equipment'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--brand-forest-vivid)', fontFamily: 'var(--font-mono)' }}>
              Tag: {item?.equipment?.asset_tag || 'Pending Tagging'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'requester',
      header: 'Custody Borrower',
      render: (req) => (
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {req?.first_name} {req?.last_name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Current State',
      render: (st) => <StatusBadge status={st?.status_name || 'pending'} />,
    },
    {
      key: 'actions',
      header: 'Dispatch Action',
      sortable: false,
      render: (_, row) => {
        const statusName = row.status?.status_name;
        if (statusName === 'approved') {
          return (
            <button
              onClick={() => setActionModal({ isOpen: true, type: 'checkout', res: row })}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <LogOut size={13} /> Check Out
            </button>
          );
        }
        if (statusName === 'active') {
          return (
            <button
              onClick={() => setActionModal({ isOpen: true, type: 'checkin', res: row })}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <LogIn size={13} /> Process Return
            </button>
          );
        }
        return <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>—</span>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Technician Banner */}
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
              <span className="badge badge-brand">Central Dispatch Desk</span>
              <span className="badge badge-lilac">STC-101 & MPAC-204</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome, {user?.first_name || 'Technician Miller'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Equipment verification desk: Handover loans, inspect returned instruments, and triage maintenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/catalog" className="btn btn-secondary">
              <Barcode size={16} />
              Asset Tag Registry
            </Link>
            <Link to="/reservations" className="btn btn-primary">
              <Wrench size={16} />
              Dispatch Queue
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* KPI StatCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Ready for Handover"
          value={isLoading ? '...' : (stats?.active_reservations ?? 14)}
          icon={LogOut}
          trend="Approved, awaiting borrower"
          trendType="up"
          colorVariant="neutral"
          sparklineData={[10, 12, 11, 14]}
        />
        <StatCard
          label="Active Loans on Campus"
          value={isLoading ? '...' : (stats?.active_reservations ?? 28)}
          icon={CheckCircle2}
          trend="Currently in custody"
          trendType="up"
          colorVariant="emerald"
          sparklineData={[20, 24, 26, 28]}
        />
        <StatCard
          label="Units in Maintenance"
          value={isLoading ? '...' : (stats?.in_maintenance ?? 3)}
          icon={Wrench}
          trend="Diagnostics in progress"
          trendType="warning"
          colorVariant="plum"
          sparklineData={[5, 4, 3, 3]}
        />
        <StatCard
          label="Available Units"
          value={isLoading ? '...' : (stats?.available_equipment ?? 114)}
          icon={Boxes}
          trend="Ready on inventory shelves"
          trendType="up"
          colorVariant="emerald"
          sparklineData={[108, 110, 112, 114]}
        />
      </div>

      {/* Dispatch Operations Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dispatch & Return Handover Desk</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scan asset tag, confirm student/staff ID badge, and log custody transition.
            </p>
          </div>
          <Link to="/reservations" className="text-brand" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Log <ArrowRight size={14} />
          </Link>
        </div>

        <DataTable
          columns={dispatchColumns}
          data={reservations}
          isLoading={isLoading}
          searchPlaceholder="Search asset tag, model or borrower name..."
          pageSize={6}
        />
      </div>

      {/* Handover Dialog Modal */}
      <GlassModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: 'checkout', res: null })}
        title={actionModal.type === 'checkout' ? 'Confirm Equipment Handover (Check-Out)' : 'Process Equipment Intake (Return)'}
        subtitle={`Reservation #${actionModal.res?.reservation_id} • Borrower: ${actionModal.res?.requester?.first_name} ${actionModal.res?.requester?.last_name}`}
        footer={
          <>
            <button
              onClick={() => setActionModal({ isOpen: false, type: 'checkout', res: null })}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={actionModal.type === 'checkout' ? handleCheckout : handleCheckin}
              disabled={isProcessing}
              className="btn btn-primary"
            >
              {isProcessing
                ? 'Processing...'
                : actionModal.type === 'checkout'
                ? 'Confirm Handover & Print Receipt'
                : 'Complete Intake & Return to Shelf'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', fontSize: '0.825rem' }}>
            <div><strong>Equipment:</strong> {actionModal.res?.items?.[0]?.model?.model_name || 'Department Hardware'}</div>
            <div><strong>Asset Tag:</strong> <span className="font-mono">{actionModal.res?.items?.[0]?.equipment?.asset_tag || 'Unassigned'}</span></div>
            <div><strong>Dispatch Desk:</strong> STC-101 (Central Dispatch Depot)</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {actionModal.type === 'checkout' ? 'Pre-Loan Inspection Notes' : 'Post-Return Condition Assessment'}
            </label>
            <textarea
              rows="3"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder={actionModal.type === 'checkout' ? 'Verify cables, power brick, lens caps, and pristine casing.' : 'Document any scratches, missing connectors, or need for lens cleaning.'}
              className="form-textarea"
            />
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
