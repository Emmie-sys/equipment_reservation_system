import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Laptop, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Info,
  Clock
} from 'lucide-react';
import { equipmentApi } from '../../api/equipment';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

export default function EquipmentCatalogPage() {
  const { user } = useAuthContext();
  const [equipmentList, setEquipmentList] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reservation form state
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    purpose_type_id: 1, // 1 = Lecture/Class
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
    
    // Set default dates: tomorrow 09:00 to 17:00
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
    } catch (err) {
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
      setSubmitSuccess(`Reservation #${res.data.reservation_id} submitted successfully! It is now pending approval.`);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchEquipment();
      }, 2000);
    } catch (err) {
      if (err.status === 409) {
        setSubmitError('Schedule conflict detected! This equipment is already booked during these hours.');
      } else {
        setSubmitError(err.message || 'Failed to submit reservation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Equipment Catalog</h1>
          <p className="text-sm text-slate-400">
            Browse institutional hardware, lab equipment, audiovisual units, and check real-time availability.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search by asset tag, model name, manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-56">
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="available">Available Now</option>
            <option value="reserved">Reserved</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="spinner mx-auto mb-3"></div>
          Loading institutional equipment catalog...
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <Laptop size={48} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No equipment found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipmentList.map((unit) => {
            const isAvailable = unit.status?.status_name === 'available';
            const location = unit.room 
              ? `${unit.room.building?.building_name || ''} - Room ${unit.room.room_code}`
              : 'Institutional Storage Vault';

            return (
              <div key={unit.equipment_id} className="equipment-card flex flex-col justify-between">
                <div>
                  <div className="equipment-card-img">
                    <Laptop className="text-indigo-400/80" />
                  </div>
                  <div className="equipment-card-body">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {unit.asset_tag}
                      </span>
                      <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
                        {unit.status?.status_name || 'Available'}
                      </span>
                    </div>

                    <h4 className="equipment-card-title text-white">
                      {unit.model?.model_name || 'Standard Equipment'}
                    </h4>
                    <p className="equipment-card-sub">
                      {unit.model?.manufacturer || 'Department Equipment'} • Serial: {unit.serial_number || 'N/A'}
                    </p>

                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-3">
                      <MapPin size={13} className="text-slate-500" />
                      <span className="truncate">{location}</span>
                    </div>

                    {unit.condition_notes && (
                      <div className="text-[11px] text-slate-500 italic mt-2">
                        "{unit.condition_notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    {unit.is_bookable ? 'Bookable' : 'Internal Use Only'}
                  </span>
                  <button
                    onClick={() => handleOpenReserveModal(unit)}
                    disabled={!unit.is_bookable}
                    className="btn btn-primary btn-sm"
                  >
                    <Calendar size={14} />
                    Reserve Unit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Modal */}
      {isModalOpen && selectedUnit && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Reserve: {selectedUnit.model?.model_name || selectedUnit.asset_tag}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReservation}>
              <div className="modal-body space-y-4">
                {submitError && (
                  <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}
                {submitSuccess && (
                  <div className="alert alert-success">
                    <CheckCircle size={16} />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div><strong>Asset Tag:</strong> {selectedUnit.asset_tag}</div>
                  <div><strong>Current Location:</strong> {selectedUnit.room?.room_code || 'Main Depot'}</div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input text-xs"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input text-xs"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                {/* Availability Check Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    disabled={isChecking}
                    className="btn btn-secondary btn-sm"
                  >
                    <Clock size={14} />
                    {isChecking ? 'Checking Conflict Engine...' : 'Check Availability'}
                  </button>

                  {availabilityCheck && (
                    <span className={`text-xs font-semibold flex items-center gap-1 ${
                      availabilityCheck.is_available ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {availabilityCheck.is_available ? (
                        <>
                          <CheckCircle size={14} /> Unit is free for this slot
                        </>
                      ) : (
                        <>
                          <AlertCircle size={14} /> Conflict: already reserved!
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Purpose Type */}
                <div className="form-group">
                  <label className="form-label">Reservation Purpose</label>
                  <select
                    className="form-select"
                    value={formData.purpose_type_id}
                    onChange={(e) => setFormData({ ...formData, purpose_type_id: e.target.value })}
                  >
                    <option value={1}>Lecture / Academic Class</option>
                    <option value={2}>Lab Experimentation</option>
                    <option value={3}>Institutional Event / Presentation</option>
                    <option value={4}>Field Research Project</option>
                    <option value={5}>Student Society / Club</option>
                  </select>
                </div>

                {/* Details */}
                <div className="form-group">
                  <label className="form-label">Purpose Details / Justification</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Brief description of intended institutional use..."
                    rows={2}
                    value={formData.purpose_details}
                    onChange={(e) => setFormData({ ...formData, purpose_details: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (availabilityCheck && !availabilityCheck.is_available)}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
