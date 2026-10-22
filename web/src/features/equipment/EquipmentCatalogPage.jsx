import React, { useEffect, useState } from 'react';
import {
  Search,
  Laptop,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Boxes,
  Shield,
  Layers,
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

  const isStaffOrAdmin = user?.roles?.some((r) =>
    ['ADMIN', 'ATTENDANT', 'TECHNICIAN'].includes(r?.toUpperCase())
  );

  // Metadata for Admin / Attendant forms
  const [models, setModels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Reservation form modal (for students/lecturers/staff booking)
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

  // Add Equipment Modal (Staff/Admin CRUD)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    model_id: '',
    asset_tag: '',
    serial_number: '',
    current_room_id: '',
    status_id: 1,
    condition_notes: 'Brand new / operational hardware unit.',
    is_bookable: true,
  });
  const [addError, setAddError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit Equipment Modal (Staff/Admin CRUD)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editForm, setEditForm] = useState({
    model_id: '',
    asset_tag: '',
    serial_number: '',
    current_room_id: '',
    status_id: 1,
    condition_notes: '',
    is_bookable: true,
  });
  const [editError, setEditError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // General Notification / Feedback banner
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, [search, statusFilter]);

  useEffect(() => {
    if (isStaffOrAdmin) {
      loadMetadata();
    }
  }, [isStaffOrAdmin]);

  async function loadMetadata() {
    try {
      const [mRes, rRes, sRes] = await Promise.all([
        equipmentApi.getModels().catch(() => ({ data: [] })),
        equipmentApi.getRooms().catch(() => ({ data: [] })),
        equipmentApi.getStatuses().catch(() => ({ data: [] })),
      ]);
      setModels(mRes.data || []);
      setRooms(rRes.data || []);
      setStatuses(sRes.data || []);
      if (mRes.data?.length > 0 && !addForm.model_id) {
        setAddForm((prev) => ({ ...prev, model_id: mRes.data[0].model_id }));
      }
    } catch (err) {
      console.error('Failed to load equipment metadata:', err);
    }
  }

  async function fetchEquipment() {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (!isStaffOrAdmin) {
        // Students and Lecturers strictly view available equipment excluding booked units
        params.exclude_booked = 'true';
      }

      const res = await equipmentApi.getAll(params);
      setEquipmentList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Booking Flow ──────────────────────────────────────────────────────────
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
      }, 1600);
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

  // ── Staff & Admin Equipment CRUD ──────────────────────────────────────────
  const handleOpenAddModal = () => {
    setAddError(null);
    setAddForm({
      model_id: models[0]?.model_id || '',
      asset_tag: '',
      serial_number: '',
      current_room_id: rooms[0]?.room_id || '',
      status_id: statuses[0]?.status_id || 1,
      condition_notes: 'Operational and intact.',
      is_bookable: true,
    });
    setIsAddModalOpen(true);
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    setAddError(null);
    setIsAdding(true);

    try {
      await equipmentApi.create({
        model_id: parseInt(addForm.model_id, 10),
        asset_tag: addForm.asset_tag,
        serial_number: addForm.serial_number,
        current_room_id: addForm.current_room_id ? parseInt(addForm.current_room_id, 10) : null,
        status_id: parseInt(addForm.status_id, 10),
        condition_notes: addForm.condition_notes,
        is_bookable: addForm.is_bookable,
      });

      setIsAddModalOpen(false);
      setNotification({ type: 'success', message: `Unit '${addForm.asset_tag}' registered successfully.` });
      fetchEquipment();
    } catch (err) {
      setAddError(err.message || 'Failed to register equipment.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEditModal = (unit) => {
    setEditingUnit(unit);
    setEditError(null);
    setEditForm({
      model_id: unit.model_id,
      asset_tag: unit.asset_tag,
      serial_number: unit.serial_number || '',
      current_room_id: unit.room?.room_id || unit.current_room_id || '',
      status_id: unit.status?.status_id || 1,
      condition_notes: unit.condition_notes || '',
      is_bookable: unit.is_bookable !== false,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    if (!editingUnit) return;
    setEditError(null);
    setIsEditing(true);

    try {
      await equipmentApi.update(editingUnit.equipment_id, {
        model_id: parseInt(editForm.model_id, 10),
        asset_tag: editForm.asset_tag,
        serial_number: editForm.serial_number,
        current_room_id: editForm.current_room_id ? parseInt(editForm.current_room_id, 10) : null,
        status_id: parseInt(editForm.status_id, 10),
        condition_notes: editForm.condition_notes,
        is_bookable: editForm.is_bookable,
      });

      setIsEditModalOpen(false);
      setEditingUnit(null);
      setNotification({ type: 'success', message: `Unit #${editingUnit.equipment_id} updated successfully.` });
      fetchEquipment();
    } catch (err) {
      setEditError(err.message || 'Failed to update equipment unit.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteEquipment = async (unit) => {
    if (!window.confirm(`Are you sure you want to remove or decommission equipment unit '${unit.asset_tag}'?`)) {
      return;
    }

    try {
      const res = await equipmentApi.delete(unit.equipment_id);
      setNotification({ type: 'success', message: res.message || `Equipment '${unit.asset_tag}' processed.` });
      fetchEquipment();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete equipment unit.' });
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
              <span className="badge badge-brand">
                {isStaffOrAdmin ? 'Depot Inventory Management' : 'Equipment Catalog'}
              </span>
              <span className={`badge ${isStaffOrAdmin ? 'badge-teal' : 'badge-available'}`}>
                {isStaffOrAdmin ? 'All Units (Including Booked)' : 'Ready for Booking'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              {isStaffOrAdmin ? 'Depot Hardware Fleet' : 'Equipment Catalog'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {isStaffOrAdmin
                ? 'Full inventory governance: manage hardware units, check-in availability, status updates, and equipment CRUD.'
                : 'Browse available audiovisual equipment, computing laptops, and laboratory kits ready for reservation.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isStaffOrAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <PlusCircle size={15} />
                <span>Add Equipment</span>
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--glass-surface-secondary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                title="Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notification banner */}
      {notification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: notification.type === 'success' ? 'rgba(0, 128, 128, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${notification.type === 'success' ? 'var(--brand-teal-vivid)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: notification.type === 'success' ? 'var(--brand-teal-vivid)' : '#ef4444',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="btn btn-ghost btn-sm" style={{ padding: '0 0.3rem' }}>
            <X size={14} />
          </button>
        </div>
      )}

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

          {/* Status filter: Staff see all options; Students see available indicator */}
          {isStaffOrAdmin ? (
            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="">All Fleet Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved / Allocated</option>
                <option value="checked_out">Checked Out / In Use</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="faulty">Faulty / Needs Repair</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
              <span>Showing unbooked, available equipment ready for checkout</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Catalog Display */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description={
            isStaffOrAdmin
              ? 'No equipment units match your current filter.'
              : 'There are currently no available, unbooked equipment units in this category.'
          }
          icon={Laptop}
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {equipmentList.map((unit) => {
            const isAvailable = unit.status?.status_name === 'available';
            const location = unit.room
              ? `${unit.room.building?.building_name || 'Campus Depot'} • ${unit.room.room_code}`
              : 'Central Lab Storage';

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
                        background: 'var(--brand-teal-dim)',
                        border: '1px solid var(--glass-border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-teal-vivid)',
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
                    {unit.model?.manufacturer || 'University Depot'} • {unit.model?.category?.category_name || 'Hardware'}
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
                    {unit.condition_notes && (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem' }}>
                        "{unit.condition_notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenReserveModal(unit)}
                    disabled={!isAvailable}
                    className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ flex: 1, opacity: isAvailable ? 1 : 0.6 }}
                  >
                    <Calendar size={14} />
                    {isAvailable ? 'Book This Gear' : 'Booked / Unavailable'}
                  </button>

                  {isStaffOrAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(unit)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Equipment Details"
                        style={{ padding: '0.4rem 0.6rem' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(unit)}
                        className="btn btn-ghost btn-sm"
                        title="Delete or Decommission Unit"
                        style={{ padding: '0.4rem 0.6rem', color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
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
                <th>Actions</th>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenReserveModal(unit)}
                        disabled={unit.status?.status_name !== 'available'}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Book
                      </button>
                      {isStaffOrAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(unit)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(unit)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#ef4444' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
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

      {/* Add Equipment Modal (Staff/Admin CRUD) */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Equipment Unit to Fleet"
        subtitle="Register new hardware asset into depot inventory"
        footer={
          <>
            <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleCreateEquipment}
              disabled={isAdding}
              className="btn btn-primary"
            >
              {isAdding ? 'Registering...' : 'Register Equipment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {addError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.825rem' }}>
              {addError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hardware Model *</label>
            <select
              required
              className="form-select"
              value={addForm.model_id}
              onChange={(e) => setAddForm({ ...addForm, model_id: e.target.value })}
            >
              {models.map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  {m.model_name} ({m.manufacturer}) — {m.category_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Asset Tag *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. GU-LAP-099"
                value={addForm.asset_tag}
                onChange={(e) => setAddForm({ ...addForm, asset_tag: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SN-8839201"
                value={addForm.serial_number}
                onChange={(e) => setAddForm({ ...addForm, serial_number: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Storage Room / Depot</label>
              <select
                className="form-select"
                value={addForm.current_room_id}
                onChange={(e) => setAddForm({ ...addForm, current_room_id: e.target.value })}
              >
                <option value="">No Room Assigned</option>
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_code} — {r.building_name || 'Complex'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={addForm.status_id}
                onChange={(e) => setAddForm({ ...addForm, status_id: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s.status_id} value={s.status_id}>
                    {s.status_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Condition Notes</label>
            <input
              type="text"
              className="form-input"
              value={addForm.condition_notes}
              onChange={(e) => setAddForm({ ...addForm, condition_notes: e.target.value })}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={addForm.is_bookable}
              onChange={(e) => setAddForm({ ...addForm, is_bookable: e.target.checked })}
            />
            <span>Allow general booking by students and lecturers</span>
          </label>
        </form>
      </GlassModal>

      {/* Edit Equipment Modal (Staff/Admin CRUD) */}
      <GlassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Equipment Details"
        subtitle={`Editing Unit #${editingUnit?.equipment_id} (${editingUnit?.asset_tag})`}
        footer={
          <>
            <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleUpdateEquipment}
              disabled={isEditing}
              className="btn btn-primary"
            >
              {isEditing ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleUpdateEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.825rem' }}>
              {editError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hardware Model</label>
            <select
              className="form-select"
              value={editForm.model_id}
              onChange={(e) => setEditForm({ ...editForm, model_id: e.target.value })}
            >
              {models.map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  {m.model_name} ({m.manufacturer})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Asset Tag *</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.asset_tag}
                onChange={(e) => setEditForm({ ...editForm, asset_tag: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-input"
                value={editForm.serial_number}
                onChange={(e) => setEditForm({ ...editForm, serial_number: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Storage Room / Depot</label>
              <select
                className="form-select"
                value={editForm.current_room_id}
                onChange={(e) => setEditForm({ ...editForm, current_room_id: e.target.value })}
              >
                <option value="">No Room Assigned</option>
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_code} — {r.building_name || 'Complex'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={editForm.status_id}
                onChange={(e) => setEditForm({ ...editForm, status_id: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s.status_id} value={s.status_id}>
                    {s.status_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Condition Notes</label>
            <input
              type="text"
              className="form-input"
              value={editForm.condition_notes}
              onChange={(e) => setEditForm({ ...editForm, condition_notes: e.target.value })}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={editForm.is_bookable}
              onChange={(e) => setEditForm({ ...editForm, is_bookable: e.target.checked })}
            />
            <span>Allow general booking by students and lecturers</span>
          </label>
        </form>
      </GlassModal>
    </div>
  );
}
