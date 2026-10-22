import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Boxes,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import { reservationApi } from '../../api/reservations';
import { equipmentApi } from '../../api/equipment';
import { useAuthContext } from '../../context/AuthContext';

export default function LecturerDashboard() {
  const { user } = useAuthContext();
  const [reservations, setReservations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Quick reservation form for lecture
  const [formData, setFormData] = useState({
    course_code: 'CSC 312',
    course_name: 'Database Systems & Architecture',
    equipment_id: '',
    start_time: '',
    end_time: '',
    lecture_hall: 'Science Complex STC-101',
    designated_class_rep: 'Emmanuel Mugisha (Class Rep)',
    purpose_details: 'Course lecture practical session and live database lab demonstration.',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resRes, eqRes] = await Promise.all([
        reservationApi.getAll(),
        equipmentApi.getAll({ is_bookable: true }),
      ]);
      setReservations(resRes.data || []);
      setEquipmentList(eqRes.data || []);
      if (eqRes.data?.length > 0 && !formData.equipment_id) {
        setFormData((prev) => ({ ...prev, equipment_id: eqRes.data[0].equipment_id }));
      }
    } catch (err) {
      console.error('Failed to load lecturer dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Default start time: tomorrow 09:00, end time: tomorrow 12:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const endTomorrow = new Date(tomorrow);
    endTomorrow.setHours(12, 0, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const toLocalISO = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setFormData((prev) => ({
      ...prev,
      start_time: toLocalISO(tomorrow),
      end_time: toLocalISO(endTomorrow),
    }));
  }, []);

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsSubmitting(true);

    try {
      const fullPurpose = `[${formData.course_code}: ${formData.course_name}] Room: ${formData.lecture_hall}. Designated Pickup: ${formData.designated_class_rep}. Details: ${formData.purpose_details}`;
      await reservationApi.create({
        equipment_id: parseInt(formData.equipment_id),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        purpose_details: fullPurpose,
        purpose_type_id: 6, // Academic Coursework
      });

      setActionSuccess(`Course reservation submitted for ${formData.course_code}!`);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to submit course reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const myReservations = reservations.filter(
    (r) => r.requested_by_user_id === user?.user_id || r.requester?.email === user?.email
  );
  const activeTeachingLoans = myReservations.filter((r) => r.status?.status_name === 'active');
  const pendingApprovals = myReservations.filter((r) => r.status?.status_name === 'pending');

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
              Academic Faculty Portal
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Department of Computer Science</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Faculty & Course Reservations Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Schedule laboratory gear, projection kits, and teaching hardware for upcoming lectures and practical coursework.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={16} />
          <span>Book Gear for Course</span>
        </button>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(22, 163, 74, 0.14)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', fontSize: '0.875rem' }}>
          {actionSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="My Teaching Bookings"
          value={myReservations.length}
          subtext="Active semester bookings"
          icon={BookOpen}
          color="#008080"
          loading={isLoading}
        />
        <StatCard
          label="Active Course Loans"
          value={activeTeachingLoans.length}
          subtext="Equipment currently in use"
          icon={Clock}
          color="#F26419"
          loading={isLoading}
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals.length}
          subtext="Awaiting lab technician review"
          icon={CalendarCheck}
          color="#3b82f6"
          loading={isLoading}
        />
        <StatCard
          label="Available Fleet"
          value={equipmentList.length}
          subtext="Units ready for reservation"
          icon={Boxes}
          color="#22c55e"
          loading={isLoading}
        />
      </div>

      {/* My Course Reservations Table */}
      <GlassCard padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={18} color="var(--brand-teal-vivid)" />
            <span>Course Equipment Loans & Booking Status</span>
          </h3>
          <Link to="/reservations" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>View All Records</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {myReservations.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpen size={32} style={{ opacity: 0.4, margin: '0 auto 0.75rem' }} />
            <p>You have no active equipment reservations for this semester.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
              Create First Course Booking
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {myReservations.map((res) => {
              const item = res.items?.[0];
              return (
                <div
                  key={res.reservation_id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--glass-surface-secondary)',
                    border: '1px solid var(--glass-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.925rem' }}>
                        {item?.equipment?.model?.model_name || 'Academic Hardware Kit'}
                      </strong>
                      <StatusBadge status={res.status?.status_name || 'pending'} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {res.purpose_details}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                      Tag: {item?.equipment?.asset_tag || 'Unassigned'} • Slot: {new Date(res.requested_start_datetime).toLocaleDateString()} ({new Date(res.requested_start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.requested_end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Book Gear for Course Modal */}
      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Fast-Track Course Equipment Reservation" maxWidth="600px">
        <form onSubmit={handleCreateReservation} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {actionError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)', fontSize: '0.825rem' }}>
              {actionError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Course Code *</label>
              <input
                type="text"
                required
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="e.g. CSC 312"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input
                type="text"
                required
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="e.g. Database Systems"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Equipment Asset *</label>
            <select
              required
              value={formData.equipment_id}
              onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
              className="form-input"
            >
              {equipmentList.map((eq) => (
                <option key={eq.equipment_id} value={eq.equipment_id}>
                  {eq.model?.model_name} [{eq.asset_tag}] — {eq.room?.room_code || 'Central Depot'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Session Start Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Session End Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Lecture Hall / Lab Room</label>
              <input
                type="text"
                value={formData.lecture_hall}
                onChange={(e) => setFormData({ ...formData, lecture_hall: e.target.value })}
                placeholder="e.g. STC-101"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designated Class Rep (Pickup)</label>
              <input
                type="text"
                value={formData.designated_class_rep}
                onChange={(e) => setFormData({ ...formData, designated_class_rep: e.target.value })}
                placeholder="e.g. Emmanuel Mugisha"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Purpose Notes</label>
            <textarea
              rows={2}
              value={formData.purpose_details}
              onChange={(e) => setFormData({ ...formData, purpose_details: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Submitting Booking...' : 'Confirm Course Reservation'}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
