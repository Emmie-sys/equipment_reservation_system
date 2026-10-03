import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  Laptop,
  Ban,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
  Filter,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';
import StatusBadge from '../../components/data/StatusBadge';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import { TableSkeleton } from '../../components/data/SkeletonLoader';
import EmptyState from '../../components/data/EmptyState';

function formatDateShort(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_FILTER_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const EMPTY_MODAL = { isOpen: false, type: null, reservation: null, text: '' };

export default function ReservationsPage() {
  const { user } = useAuthContext();
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionModal, setActionModal] = useState(EMPTY_MODAL);
  const [checkoutModal, setCheckoutModal] = useState({
    isOpen: false,
    reservation: null,
    conditionNotes: '',
    notes: '',
  });

  const isStaffOrAdmin = user?.roles?.some((r) => ['ADMIN', 'TECHNICIAN', 'STAFF'].includes(r));

  const fetchReservations = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setActionError(null);
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await reservationApi.getAll(params);
        setReservations(res.data || []);
      } catch (err) {
        console.error('Failed to load reservations:', err);
        setActionError('Failed to fetch reservations. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Auto-dismiss success
  useEffect(() => {
    if (!actionSuccess) return;
    const t = setTimeout(() => setActionSuccess(null), 5000);
    return () => clearTimeout(t);
  }, [actionSuccess]);

  function openModal(reservation, type) {
    setActionModal({ isOpen: true, type, reservation, text: '' });
  }

  async function handleConfirmAction(e) {
    e.preventDefault();
    const { type, reservation, text } = actionModal;
    if (!reservation) return;

    try {
      setActionError(null);

      if (type === 'approve') {
        await reservationApi.approve(reservation.reservation_id, text);
        setActionSuccess(`Booking #${reservation.reservation_id} approved successfully.`);
      } else if (type === 'reject') {
        if (!text || text.trim().length < 5) {
          setActionError('A rejection reason of at least 5 characters is required.');
          return;
        }
        await reservationApi.reject(reservation.reservation_id, text);
        setActionSuccess(`Booking #${reservation.reservation_id} was rejected.`);
      } else if (type === 'checkin') {
        await reservationApi.checkin(reservation.reservation_id, text || 'Equipment checked out.');
        setActionSuccess(`Booking #${reservation.reservation_id} — equipment checked in and is now Active.`);
      }

      setActionModal(EMPTY_MODAL);
      fetchReservations(true);
    } catch (err) {
      setActionError(err.message || 'Action failed. Please try again.');
    }
  }

  async function handleCancel(reservationId) {
    if (!window.confirm('Cancel this reservation? This action cannot be undone.')) return;
    try {
      setActionError(null);
      await reservationApi.cancel(reservationId);
      setActionSuccess(`Booking #${reservationId} was successfully cancelled.`);
      fetchReservations(true);
    } catch (err) {
      setActionError(err.message || 'Failed to cancel reservation.');
    }
  }

  async function handleCheckout(e) {
    e.preventDefault();
    const { reservation, conditionNotes, notes } = checkoutModal;
    if (!reservation) return;
    try {
      setActionError(null);
      await reservationApi.checkout(
        reservation.reservation_id,
        conditionNotes,
        notes || 'Equipment returned by requester.'
      );
      setActionSuccess(`Booking #${reservation.reservation_id} — equipment returned and marked Completed.`);
      setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' });
      fetchReservations(true);
    } catch (err) {
      setActionError(err.message || 'Return process failed.');
    }
  }

  // Status count summary
  const countByStatus = (reservations || []).reduce((acc, r) => {
    const s = r.status?.status_name || 'unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Reservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isStaffOrAdmin
              ? 'Review, approve, dispatch, and track all equipment bookings across campus.'
              : 'Manage your active and past equipment loan requests.'}
          </p>
        </div>

        <button
          onClick={() => fetchReservations(true)}
          className="btn btn-secondary btn-sm"
          disabled={isRefreshing}
          title="Refresh list"
        >
          <RefreshCw size={14} style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Toast Alerts ─────────────────────────────────────────────────── */}
      {actionSuccess && (
        <div className="alert-banner alert-banner-success">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}>
            <X size={14} />
          </button>
        </div>
      )}
      {actionError && (
        <div className="alert-banner alert-banner-error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Summary Strip ────────────────────────────────────────────────── */}
      {!isLoading && reservations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Pending', key: 'pending', color: 'var(--status-pending-text)' },
            { label: 'Approved', key: 'approved', color: 'var(--status-available-text)' },
            { label: 'Active', key: 'active', color: 'var(--status-active-text)' },
            { label: 'Completed', key: 'completed', color: 'var(--status-completed-text)' },
          ].map(({ label, key, color }) => (
            <GlassCard
              key={key}
              interactive
              onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
              style={{
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                border: statusFilter === key ? `1px solid ${color}` : undefined,
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.04em' }}>
                {countByStatus[key] || 0}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                {label}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* ── Filter Tabs ───────────────────────────────────────────────────── */}
      <GlassCard style={{ padding: '0.5rem 0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`btn btn-sm ${statusFilter === tab.value ? 'btn-primary' : 'btn-ghost'}`}
            style={{ minWidth: 0 }}
          >
            {tab.label}
            {tab.value && countByStatus[tab.value] ? (
              <span style={{
                background: statusFilter === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--glass-surface-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '0 0.35rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                minWidth: '1.25rem',
                textAlign: 'center',
              }}>
                {countByStatus[tab.value]}
              </span>
            ) : null}
          </button>
        ))}
      </GlassCard>

      {/* ── Reservation Cards (Mobile-first) / Table (Desktop) ──────────── */}
      {isLoading ? (
        <GlassCard style={{ padding: '1.5rem' }}>
          <TableSkeleton rows={5} cols={6} />
        </GlassCard>
      ) : reservations.length === 0 ? (
        <GlassCard style={{ padding: '3rem' }}>
          <EmptyState
            icon={CalendarCheck}
            title="No reservations found"
            description={
              statusFilter
                ? `No bookings with "${statusFilter}" status. Try a different filter.`
                : 'No reservation records available yet.'
            }
          />
        </GlassCard>
      ) : (
        <>
          {/* Desktop Table */}
          <GlassCard style={{ overflow: 'hidden', padding: 0 }} className="hide-mobile">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Equipment</th>
                    <th>Requester</th>
                    <th>Period</th>
                    <th style={{ width: 140 }}>Status</th>
                    <th style={{ textAlign: 'right', width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => {
                    const item = res.items?.[0]?.equipment;
                    const modelName = item?.model?.model_name || 'Standard Unit';
                    const tag = item?.asset_tag || '—';
                    const startDate = formatDateShort(res.requested_start_datetime);
                    const endDate = formatDateShort(res.requested_end_datetime);
                    const statusName = res.status?.status_name;

                    const canApproveOrReject = isStaffOrAdmin && statusName === 'pending';
                    const canCheckin = isStaffOrAdmin && (statusName === 'approved' || statusName === 'pending');
                    const canCheckout = isStaffOrAdmin && statusName === 'active';
                    const canCancel =
                      (res.requested_by_user_id === user?.user_id || isStaffOrAdmin) &&
                      ['pending', 'approved'].includes(statusName);

                    return (
                      <tr key={res.reservation_id}>
                        <td>
                          <span className="font-mono text-xs" style={{ color: 'var(--brand-forest-vivid)', fontWeight: 700 }}>
                            #{res.reservation_id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                              background: 'var(--brand-forest-dim)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Laptop size={14} style={{ color: 'var(--brand-forest-vivid)' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {modelName}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {tag}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {res.requester
                              ? `${res.requester.first_name} ${res.requester.last_name}`
                              : 'Campus User'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {res.requester?.email}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            {startDate}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', paddingLeft: '1.05rem' }}>
                            until {endDate}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={statusName} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {canApproveOrReject && (
                              <>
                                <button
                                  onClick={() => openModal(res, 'approve')}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(22,163,74,0.14)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                                  title="Approve booking"
                                >
                                  <Check size={12} />
                                  Approve
                                </button>
                                <button
                                  onClick={() => openModal(res, 'reject')}
                                  className="btn btn-danger btn-sm"
                                  title="Reject booking"
                                >
                                  <X size={12} />
                                  Reject
                                </button>
                              </>
                            )}
                            {canCheckin && (
                              <button
                                onClick={() => openModal(res, 'checkin')}
                                className="btn btn-primary btn-sm"
                                title="Hand equipment to requester"
                              >
                                <LogIn size={12} />
                                Dispatch
                              </button>
                            )}
                            {canCheckout && (
                              <button
                                onClick={() =>
                                  setCheckoutModal({
                                    isOpen: true,
                                    reservation: res,
                                    conditionNotes: '',
                                    notes: '',
                                  })
                                }
                                className="btn btn-secondary btn-sm"
                                title="Process equipment return"
                              >
                                <LogOut size={12} />
                                Return
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(res.reservation_id)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: 'var(--text-muted)' }}
                                title="Cancel booking"
                              >
                                <Ban size={12} />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Mobile Cards */}
          <div className="show-mobile" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
            {reservations.map((res) => {
              const item = res.items?.[0]?.equipment;
              const modelName = item?.model?.model_name || 'Standard Unit';
              const statusName = res.status?.status_name;
              const canApproveOrReject = isStaffOrAdmin && statusName === 'pending';
              const canCheckin = isStaffOrAdmin && (statusName === 'approved' || statusName === 'pending');
              const canCheckout = isStaffOrAdmin && statusName === 'active';
              const canCancel =
                (res.requested_by_user_id === user?.user_id || isStaffOrAdmin) &&
                ['pending', 'approved'].includes(statusName);

              return (
                <GlassCard key={res.reservation_id} style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{modelName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--brand-forest-vivid)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        #{res.reservation_id}
                      </div>
                    </div>
                    <StatusBadge status={statusName} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    <Clock size={12} />
                    {formatDateShort(res.requested_start_datetime)} — {formatDateShort(res.requested_end_datetime)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {canApproveOrReject && (
                      <>
                        <button onClick={() => openModal(res, 'approve')} className="btn btn-sm" style={{ background: 'rgba(22,163,74,0.14)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', fontSize: '0.75rem' }}>
                          <Check size={11} /> Approve
                        </button>
                        <button onClick={() => openModal(res, 'reject')} className="btn btn-danger btn-sm" style={{ fontSize: '0.75rem' }}>
                          <X size={11} /> Reject
                        </button>
                      </>
                    )}
                    {canCheckin && <button onClick={() => openModal(res, 'checkin')} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}><LogIn size={11} /> Dispatch</button>}
                    {canCheckout && <button onClick={() => setCheckoutModal({ isOpen: true, reservation: res, conditionNotes: '', notes: '' })} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}><LogOut size={11} /> Return</button>}
                    {canCancel && <button onClick={() => handleCancel(res.reservation_id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}><Ban size={11} /> Cancel</button>}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </>
      )}

      {/* ── Approve / Reject / Dispatch Modal ────────────────────────────── */}
      <GlassModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal(EMPTY_MODAL)}
        title={
          actionModal.type === 'checkin'
            ? `Dispatch Equipment — Booking #${actionModal.reservation?.reservation_id}`
            : `${actionModal.type === 'approve' ? 'Approve' : 'Reject'} Booking #${actionModal.reservation?.reservation_id}`
        }
        icon={actionModal.type === 'approve' ? <Check size={18} /> : actionModal.type === 'reject' ? <X size={18} /> : <LogIn size={18} />}
      >
        <form onSubmit={handleConfirmAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.8375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {actionModal.type === 'approve' &&
              'Confirming approval will lock this time slot and notify the requester.'}
            {actionModal.type === 'reject' &&
              'Provide a clear justification. The requester will receive this as feedback.'}
            {actionModal.type === 'checkin' &&
              'Confirm equipment has been physically handed over. The reservation moves to Active status.'}
          </p>

          <div className="form-group">
            <label className="form-label">
              {actionModal.type === 'approve' && 'Comments / Pickup Notes (Optional)'}
              {actionModal.type === 'reject' && 'Rejection Reason (Required)'}
              {actionModal.type === 'checkin' && 'Handover Notes (Optional)'}
            </label>
            <textarea
              className="form-textarea"
              placeholder={
                actionModal.type === 'approve'
                  ? 'E.g., Pickup available at Depot B between 08:30–09:00.'
                  : actionModal.type === 'reject'
                  ? 'E.g., Equipment scheduled for calibration during this window.'
                  : 'E.g., Unit confirmed operational. Power cable included.'
              }
              rows={3}
              required={actionModal.type === 'reject'}
              value={actionModal.text}
              onChange={(e) => setActionModal({ ...actionModal, text: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setActionModal(EMPTY_MODAL)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={
                actionModal.type === 'approve' || actionModal.type === 'checkin'
                  ? 'btn btn-primary'
                  : 'btn btn-danger'
              }
            >
              {actionModal.type === 'approve' && <><Check size={15} /> Confirm Approval</>}
              {actionModal.type === 'reject' && <><X size={15} /> Confirm Rejection</>}
              {actionModal.type === 'checkin' && <><LogIn size={15} /> Confirm Dispatch</>}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* ── Return / Check-out Modal ──────────────────────────────────────── */}
      <GlassModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' })}
        title={`Process Return — Booking #${checkoutModal.reservation?.reservation_id}`}
        icon={<LogOut size={18} />}
      >
        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.8375rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Confirm the equipment has been physically returned. The unit will become available for new bookings.
          </p>

          <div className="form-group">
            <label className="form-label">Return Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="E.g., Returned on time. All accessories present."
              rows={2}
              value={checkoutModal.notes}
              onChange={(e) => setCheckoutModal({ ...checkoutModal, notes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Condition Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="E.g., Minor scuff on casing. No functional damage."
              rows={2}
              value={checkoutModal.conditionNotes}
              onChange={(e) =>
                setCheckoutModal({ ...checkoutModal, conditionNotes: e.target.value })
              }
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' })}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FileText size={15} />
              Confirm Return
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
