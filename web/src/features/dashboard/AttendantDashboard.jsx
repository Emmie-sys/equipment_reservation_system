import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Boxes,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
  UserPlus,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ClipboardCheck,
  Package,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import DataTable from '../../components/data/DataTable';
import ProvisionStudentModal from '../../components/students/ProvisionStudentModal';
import { dashboardApi } from '../../api/dashboard';
import { reservationApi } from '../../api/reservations';
import { studentsApi } from '../../api/students';

export default function AttendantDashboard() {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Return modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedResForReturn, setSelectedResForReturn] = useState(null);
  const [conditionNotes, setConditionNotes] = useState('Equipment inspected: All parts returned in operational condition.');

  // Student Provisioning modal
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);

  // Student verification search
  const [lookupQuery, setLookupQuery] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

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
      console.error('Failed to load attendant operations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hand over equipment to requester (Check-in)
  const handleHandover = async (resId) => {
    try {
      setIsProcessing(true);
      await reservationApi.checkin(resId, 'Physical equipment handed over at dispatch desk.');
      setFeedback({ type: 'success', message: `Reservation #${resId} marked as handed over (Active Loan).` });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Handover failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (res) => {
    setSelectedResForReturn(res);
    setConditionNotes('All components, cables, and accessories inspected and intact.');
    setReturnModalOpen(true);
  };

  // Confirm Return (Check-out)
  const handleConfirmReturn = async () => {
    if (!selectedResForReturn) return;
    try {
      setIsProcessing(true);
      await reservationApi.checkout(
        selectedResForReturn.reservation_id,
        conditionNotes,
        'Equipment received and returned to available inventory.'
      );
      setReturnModalOpen(false);
      setSelectedResForReturn(null);
      setFeedback({ type: 'success', message: `Equipment returned successfully and restocked.` });
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Return processing failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Search student by student number
  const handleStudentLookup = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setVerifiedStudent(null);

    try {
      const res = await studentsApi.getByStudentNumber(lookupQuery.trim());
      setVerifiedStudent(res.data);
    } catch (err) {
      setLookupError(`No registered university student found matching '${lookupQuery.trim()}'.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const pendingPickups = reservations.filter(
    (r) => r.status?.status_name === 'approved' || r.status?.status_name === 'pending'
  );
  const activeLoans = reservations.filter((r) => r.status?.status_name === 'active');

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
              Equipment Lab Attendant
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Central Dispatch Desk (STC-101)</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Equipment Dispatch & Handover Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage physical check-ins, inspect returned gear, verify student identities, and provision new students.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setProvisionModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={16} />
            <span>Provision Student</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: feedback.type === 'success' ? 'rgba(22, 163, 74, 0.14)' : 'var(--status-rejected-bg)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'var(--status-rejected-border)'}`,
            color: feedback.type === 'success' ? '#22c55e' : 'var(--status-rejected-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Operational KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="Pending Handover Pickups"
          value={pendingPickups.length}
          subtext="Approved & waiting at desk"
          icon={Package}
          color="#008080"
          loading={isLoading}
        />
        <StatCard
          label="Active Loans in Use"
          value={activeLoans.length}
          subtext="Currently with students/faculty"
          icon={Clock}
          color="#F26419"
          loading={isLoading}
        />
        <StatCard
          label="Available Fleet"
          value={stats?.available_equipment ?? '—'}
          subtext={`Out of ${stats?.total_equipment ?? '—'} total units`}
          icon={Boxes}
          color="#22c55e"
          loading={isLoading}
        />
        <StatCard
          label="Under Maintenance"
          value={stats?.in_maintenance ?? '—'}
          subtext="Inspection & calibration"
          icon={Wrench}
          color="#38bdf8"
          loading={isLoading}
        />
      </div>

      {/* Student Identity Verification Bar */}
      <GlassCard padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--brand-teal-vivid)" />
              <span>Counter Student Verification</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scan or enter a Student ID number (e.g. <code style={{ fontFamily: 'var(--font-mono)' }}>GU/2026/BIT/042</code>) to confirm eligibility.
            </p>
          </div>
        </div>

        <form onSubmit={handleStudentLookup} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Enter Student Number (e.g. GU/2026/BIT/042)..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <button type="submit" disabled={isLookingUp} className="btn btn-secondary">
            {isLookingUp ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>

        {lookupError && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)', fontSize: '0.825rem' }}>
            {lookupError}
          </div>
        )}

        {verifiedStudent && (
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--glass-surface-secondary)',
              border: '1px solid var(--glass-border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--brand-teal-dim)',
                  border: '1px solid var(--brand-teal-vivid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--brand-teal-vivid)',
                }}
              >
                {verifiedStudent.first_name?.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {verifiedStudent.first_name} {verifiedStudent.last_name}
                  </h4>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    Active Student
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.85rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {verifiedStudent.student_number}</span>
                  <span>•</span>
                  <span>{verifiedStudent.email}</span>
                  <span>•</span>
                  <span>Year {verifiedStudent.year_of_study || 3}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setVerifiedStudent(null)}
                className="btn btn-ghost btn-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Today's Queue: Handover Pickups & Returns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Pickup Queue */}
        <GlassCard padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--brand-teal-vivid)" />
              <span>Pending Equipment Handover</span>
            </h3>
            <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
              {pendingPickups.length} scheduled
            </span>
          </div>

          {pendingPickups.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No equipment currently waiting for pickup.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingPickups.slice(0, 5).map((res) => {
                const item = res.items?.[0];
                return (
                  <div
                    key={res.reservation_id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--glass-surface-secondary)',
                      border: '1px solid var(--glass-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {item?.equipment?.model?.model_name || 'Equipment Unit'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Requested by: <strong>{res.requester?.first_name} {res.requester?.last_name}</strong>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Tag: {item?.equipment?.asset_tag || 'Unassigned'} • Res #{res.reservation_id}
                      </div>
                    </div>

                    <button
                      onClick={() => handleHandover(res.reservation_id)}
                      disabled={isProcessing}
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Hand Over</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Return Queue */}
        <GlassCard padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} color="var(--brand-orange)" />
              <span>Active Loans / Return Processing</span>
            </h3>
            <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
              {activeLoans.length} active
            </span>
          </div>

          {activeLoans.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No active loans currently checked out.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeLoans.slice(0, 5).map((res) => {
                const item = res.items?.[0];
                return (
                  <div
                    key={res.reservation_id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--glass-surface-secondary)',
                      border: '1px solid var(--glass-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {item?.equipment?.model?.model_name || 'Equipment Unit'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Borrower: <strong>{res.requester?.first_name} {res.requester?.last_name}</strong>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--brand-orange)', fontWeight: 600 }}>
                        Active Loan • Res #{res.reservation_id}
                      </div>
                    </div>

                    <button
                      onClick={() => openReturnModal(res)}
                      disabled={isProcessing}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <ClipboardCheck size={14} />
                      <span>Inspect & Return</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Return Inspection Modal */}
      <GlassModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Check-Out / Equipment Return Inspection"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Confirm that the borrower has physically returned all equipment parts. Document any scratches, missing lens caps, or cable damage before returning to stock.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Condition & Inspection Report</label>
            <textarea
              rows={3}
              className="form-input"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Notes on equipment physical state..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={() => setReturnModalOpen(false)}
              className="btn btn-secondary"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReturn}
              className="btn btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Return...' : 'Complete Return & Restock'}
            </button>
          </div>
        </div>
      </GlassModal>

      {/* Provision Student Modal */}
      <ProvisionStudentModal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
