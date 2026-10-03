import React, { useEffect, useState } from 'react';
import {
  Search,
  Laptop,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { equipmentApi } from '../../api/equipment';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import StatusBadge from '../../components/data/StatusBadge';
import EmptyState from '../../components/data/EmptyState';
import { TableSkeleton } from '../../components/data/SkeletonLoader';

export default function EquipmentCatalogPage() {
  const { user } = useAuthContext();
  const [equipmentList, setEquipmentList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Reservation form modal
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    purpose_type_id: 1,
    purpose_details: '',
  });
  const [availabilityCheck, setAvailabilityCheck] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [search, statusFilter]);

  async function fetchEquipment() {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await equipmentApi.getAll(params);
      setEquipmentList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenReserveModal = (unit) => {
    setSelectedUnit(unit);
    setSubmitError(null);
    setSubmitSuccess(null);
    setAvailabilityCheck(null);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startIso = `${tomorrow.toISOString().split('T')[0]}T09:00`;
    const endIso = `${tomorrow.toISOString().split('T')[0]}T17:00`;

    setFormData({
      start_time: startIso,
      end_time: endIso,
      purpose_type_id: 1,
      purpose_details: '',
    });

    setIsModalOpen(true);
  };

  const handleCheckAvailability = async () => {
    if (!formData.start_time || !formData.end_time || !selectedUnit) return;
    try {
      setIsChecking(true);
      setSubmitError(null);
      const res = await equipmentApi.checkAvailability(
        selectedUnit.equipment_id,
        formData.start_time,
        formData.end_time
      );
      setAvailabilityCheck(res.data);
    } catch {
      setSubmitError('Failed to verify scheduling availability. Please check the dates.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const payload = {
        equipment_id: selectedUnit.equipment_id,
        model_id: selectedUnit.model_id,
        purpose_type_id: parseInt(formData.purpose_type_id, 10),
        purpose_details: formData.purpose_details,
        start_time: formData.start_time,
        end_time: formData.end_time,
        pickup_room_id: selectedUnit.current_room_id,
      };

      const res = await reservationApi.create(payload);
      setSubmitSuccess(`Reservation #${res.data.reservation_id} submitted! Pending review.`);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchEquipment();
      }, 1800);
    } catch (err) {
      if (err.status === 409) {
        setSubmitError('Schedule conflict! This unit is already booked during these requested hours.');
      } else {
        setSubmitError(err.message || 'Failed to submit reservation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
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
              <span className="badge badge-brand">Catalog & Hardware Inventory</span>
              <span className="badge badge-available">Real-Time Availability</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Equipment Catalog</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Audiovisual, computing workstations, photography cameras, and laboratory instrumentation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              title="Grid View"
            >
              <LayoutGrid size={15} /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              title="Table View"
            >
              <List size={15} /> Table
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Filter & Search Bar */}
      <GlassCard padding="1rem 1.25rem">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '480px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.85rem' }}
              placeholder="Search by asset tag, model, or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '38px', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="reserved">Reserved</option>
              <option value="checked_out">Checked Out</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Catalog Display */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try adjusting your search criteria or status filter to find available hardware."
          icon={Laptop}
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {equipmentList.map((unit) => {
            const isAvailable = unit.status?.status_name === 'available';
            const location = unit.room
              ? `${unit.room.building?.building_name || 'Complex'} • ${unit.room.room_code}`
              : 'Central Storage';

            return (
              <GlassCard
                key={unit.equipment_id}
                interactive
                padding="1.35rem"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--brand-forest-dim)',
                        border: '1px solid var(--glass-border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-forest-vivid)',
                      }}
                    >
                      <Laptop size={20} />
                    </div>
                    <StatusBadge status={unit.status?.status_name} />
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {unit.model?.model_name || 'Standard Equipment Unit'}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    {unit.model?.manufacturer || 'Department Asset'} • {unit.model?.category?.category_name || 'General'}
                  </div>

                  <div
                    style={{
                      background: 'var(--glass-surface-secondary)',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--glass-border-subtle)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Asset Tag: </span>
                      <strong className="font-mono text-brand">{unit.asset_tag}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={12} /> {location}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReserveModal(unit)}
                  disabled={!isAvailable}
                  className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ width: '100%', opacity: isAvailable ? 1 : 0.6 }}
                >
                  <Calendar size={14} />
                  {isAvailable ? 'Book This Equipment' : 'Check Schedule'}
                </button>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Model & Category</th>
                <th>Manufacturer</th>
                <th>Depot Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((unit) => (
                <tr key={unit.equipment_id}>
                  <td className="font-mono text-brand font-semibold text-xs">{unit.asset_tag}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{unit.model?.model_name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{unit.model?.category?.category_name}</div>
                  </td>
                  <td>{unit.model?.manufacturer}</td>
                  <td>{unit.room?.room_code || 'Central'}</td>
                  <td><StatusBadge status={unit.status?.status_name} /></td>
                  <td>
                    <button
                      onClick={() => handleOpenReserveModal(unit)}
                      disabled={unit.status?.status_name !== 'available'}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservation Booking Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserve Equipment Unit"
        subtitle={selectedUnit?.model?.model_name}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmitReservation}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitReservation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {submitSuccess && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-available-bg)',
                border: '1px solid var(--status-available-border)',
                color: 'var(--status-available-text)',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle size={18} />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-rejected-bg)',
                border: '1px solid var(--status-rejected-border)',
                color: 'var(--status-rejected-text)',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '0.85rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div><strong>Asset Tag:</strong> <span className="font-mono text-brand">{selectedUnit?.asset_tag}</span></div>
            <div><strong>Pickup Room:</strong> {selectedUnit?.room?.room_code || 'STC-101'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Pickup Date & Time</label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Return Date & Time</label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={isChecking}
              className="btn btn-secondary btn-sm"
            >
              <Clock size={14} />
              {isChecking ? 'Verifying Calendar...' : 'Check Availability'}
            </button>
            {availabilityCheck && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: availabilityCheck.is_available ? 'var(--status-available-text)' : 'var(--status-rejected-text)',
                }}
              >
                {availabilityCheck.is_available ? '✓ No schedule conflicts' : '⚠ Overlapping booking exists!'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Academic Purpose Type</label>
            <select
              className="form-select"
              value={formData.purpose_type_id}
              onChange={(e) => setFormData({ ...formData, purpose_type_id: e.target.value })}
            >
              <option value="1">Coursework / Class Demonstration</option>
              <option value="2">Faculty Research & Field Study</option>
              <option value="3">Institutional Event / Media Production</option>
              <option value="4">Student Organization / Extra-curricular</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose Details & Course Code</label>
            <textarea
              rows="2"
              required
              className="form-textarea"
              placeholder="e.g. Senior Capstone Project demonstration in Room STC-101"
              value={formData.purpose_details}
              onChange={(e) => setFormData({ ...formData, purpose_details: e.target.value })}
            />
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
