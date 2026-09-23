import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  Search,
  Laptop,
  Ban,
  CheckCircle2,
  LogIn,
  LogOut,
  FileText,
} from 'lucide-react';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

function formatDateShort(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_LABELS = {
  approved: <span className="badge badge-approved">Approved</span>,
  pending: <span className="badge badge-pending">Pending Review</span>,
  rejected: <span className="badge badge-rejected">Rejected</span>,
  active: <span className="badge badge-active">Active</span>,
  cancelled: <span className="badge badge-cancelled">Cancelled</span>,
  completed: <span className="badge badge-completed">Completed</span>,
};

function getStatusBadge(statusName) {
  return STATUS_LABELS[statusName] || <span className="badge badge-pending">{statusName}</span>;
}

const EMPTY_MODAL = { isOpen: false, type: null, reservation: null, text: '' };

export default function ReservationsPage() {
  const { user } = useAuthContext();
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionModal, setActionModal] = useState(EMPTY_MODAL);
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, reservation: null, conditionNotes: '', notes: '' });

  const isStaffOrAdmin = user?.roles?.some((r) => ['ADMIN', 'TECHNICIAN', 'STAFF'].includes(r));

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  async function fetchReservations() {
    try {
      setIsLoading(true);
      setActionError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await reservationApi.getAll(params);
      setReservations(res.data || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setActionError('Failed to fetch reservations list.');
    } finally {
      setIsLoading(false);
    }
  }

  function openModal(reservation, type) {
    setActionModal({ isOpen: true, type, reservation, text: '' });
  }

  async function handleConfirmAction(e) {
    e.preventDefault();
    const { type, reservation, text } = actionModal;
    if (!reservation) return;

    try {
      setActionError(null);
      setActionSuccess(null);

      if (type === 'approve') {
        await reservationApi.approve(reservation.reservation_id, text);
        setActionSuccess(`Reservation #${reservation.reservation_id} was approved.`);
      } else if (type === 'reject') {
        if (!text || text.trim().length < 5) {
          setActionError('A rejection reason of at least 5 characters is required.');
          return;
        }
        await reservationApi.reject(reservation.reservation_id, text);
        setActionSuccess(`Reservation #${reservation.reservation_id} was rejected.`);
      } else if (type === 'checkin') {
        await reservationApi.checkin(reservation.reservation_id, text || 'Equipment checked out to requester.');
        setActionSuccess(`Reservation #${reservation.reservation_id} — equipment checked in (now Active).`);
      }

      setActionModal(EMPTY_MODAL);
      fetchReservations();
    } catch (err) {
      setActionError(err.message || 'Action failed.');
    }
  }

  async function handleCancel(reservationId) {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      setActionError(null);
      await reservationApi.cancel(reservationId);
      setActionSuccess(`Reservation #${reservationId} was cancelled.`);
      fetchReservations();
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
      await reservationApi.checkout(reservation.reservation_id, conditionNotes, notes || 'Equipment returned by requester.');
      setActionSuccess(`Reservation #${reservation.reservation_id} — equipment returned and marked Completed.`);
      setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' });
      fetchReservations();
    } catch (err) {
      setActionError(err.message || 'Return process failed.');
    }
  }

  const STATUS_FILTER_TABS = [
    { label: 'All Bookings', value: '' },
    { label: 'Pending Review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Reservations Management</h1>
          <p className="text-sm text-slate-400">
            {isStaffOrAdmin
              ? 'Review, approve, check-in, and track institutional equipment bookings.'
              : 'View status history and manage your active and past equipment bookings.'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card p-3 flex flex-wrap gap-2 items-center">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`btn btn-sm ${statusFilter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="spinner mx-auto mb-3"></div>
            Loading reservations...
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarCheck size={48} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No reservations found</h3>
            <p className="text-sm text-slate-500">There are no records matching your current filter.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Equipment Item</th>
                  <th>Requester</th>
                  <th>Window (Start — End)</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => {
                  const item = res.items?.[0]?.equipment;
                  const modelName = item?.model?.model_name || 'Standard Unit';
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
                      <td className="font-mono text-xs text-indigo-400 font-semibold">
                        #{res.reservation_id}
                      </td>
                      <td>
                        <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                          <Laptop size={14} className="text-indigo-400" />
                          {modelName}
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5">
                          Tag: {item?.asset_tag || 'Unassigned'}
                        </div>
                      </td>
                      <td className="text-xs">
                        <div className="font-medium text-slate-200">
                          {res.requester
                            ? `${res.requester.first_name} ${res.requester.last_name}`
                            : 'Institutional User'}
                        </div>
                        <div className="text-[11px] text-slate-500">{res.requester?.email}</div>
                      </td>
                      <td className="text-xs text-slate-300">
                        <div>{startDate}</div>
                        <div className="text-slate-500 text-[11px]">until {endDate}</div>
                      </td>
                      <td>{getStatusBadge(statusName)}</td>
                      <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                        <div className="flex gap-1 justify-end flex-wrap">
                          {canApproveOrReject && (
                            <>
                              <button
                                onClick={() => openModal(res, 'approve')}
                                className="btn btn-success btn-sm"
                                title="Approve booking"
                              >
                                <Check size={13} />
                                Approve
                              </button>
                              <button
                                onClick={() => openModal(res, 'reject')}
                                className="btn btn-danger btn-sm"
                                title="Reject booking"
                              >
                                <X size={13} />
                                Reject
                              </button>
                            </>
                          )}
                          {canCheckin && (
                            <button
                              onClick={() => openModal(res, 'checkin')}
                              className="btn btn-primary btn-sm"
                              title="Check-in: hand equipment to requester"
                            >
                              <LogIn size={13} />
                              Check-In
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
                              title="Check-out: process equipment return"
                            >
                              <LogOut size={13} />
                              Return
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(res.reservation_id)}
                              className="btn btn-secondary btn-sm"
                              title="Cancel booking"
                            >
                              <Ban size={13} />
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
        )}
      </div>

      {/* Approve / Reject / Check-in Modal */}
      {actionModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h3 className="text-base font-bold text-white capitalize">
                {actionModal.type === 'checkin' ? 'Check-In Equipment' : `${actionModal.type} Reservation`}
                {' '}#{actionModal.reservation?.reservation_id}
              </h3>
              <button onClick={() => setActionModal(EMPTY_MODAL)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmAction}>
              <div className="modal-body space-y-4">
                <p className="text-xs text-slate-300">
                  {actionModal.type === 'approve' &&
                    'Confirming approval will lock this time slot and notify the requester.'}
                  {actionModal.type === 'reject' &&
                    'Provide a clear justification for rejecting this booking request.'}
                  {actionModal.type === 'checkin' &&
                    'Confirm that the equipment has been physically handed over to the requester. The reservation will move to Active status.'}
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
                        ? 'E.g., Pickup available at Depot B between 08:30-09:00.'
                        : actionModal.type === 'reject'
                        ? 'E.g., Equipment scheduled for routine calibration during this window.'
                        : 'E.g., Unit confirmed operational. Power cable included.'
                    }
                    rows={3}
                    required={actionModal.type === 'reject'}
                    value={actionModal.text}
                    onChange={(e) => setActionModal({ ...actionModal, text: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setActionModal(EMPTY_MODAL)} className="btn btn-secondary">
                  Close
                </button>
                <button
                  type="submit"
                  className={
                    actionModal.type === 'approve' || actionModal.type === 'checkin'
                      ? 'btn btn-primary'
                      : 'btn btn-danger'
                  }
                >
                  {actionModal.type === 'approve' && 'Confirm Approval'}
                  {actionModal.type === 'reject' && 'Confirm Rejection'}
                  {actionModal.type === 'checkin' && 'Confirm Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return / Check-out Modal */}
      {checkoutModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h3 className="text-base font-bold text-white">
                Process Equipment Return — #{checkoutModal.reservation?.reservation_id}
              </h3>
              <button
                onClick={() => setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCheckout}>
              <div className="modal-body space-y-4">
                <p className="text-xs text-slate-300">
                  Confirm that the equipment has been physically returned. The reservation will be
                  marked Completed and the unit will become available for new bookings.
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
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setCheckoutModal({ isOpen: false, reservation: null, conditionNotes: '', notes: '' })}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  <FileText size={14} />
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
