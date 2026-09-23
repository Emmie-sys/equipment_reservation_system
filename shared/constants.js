/**
 * Shared System Constants: Equipment Reservation System
 * Framework-agnostic constants used across Web (React) and Mobile (React Native)
 */

export const USER_ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  STUDENT: 'STUDENT',
  TECHNICIAN: 'TECHNICIAN',
});

export const EQUIPMENT_STATUS = Object.freeze({
  AVAILABLE: {
    key: 'available',
    label: 'Available for Booking',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    color: '#10b981',
  },
  RESERVED: {
    key: 'reserved',
    label: 'Reserved',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    color: '#6366f1',
  },
  CHECKED_OUT: {
    key: 'checked_out',
    label: 'Checked Out / In Use',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    color: '#f59e0b',
  },
  MAINTENANCE: {
    key: 'maintenance',
    label: 'Under Maintenance',
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    color: '#ef4444',
  },
  RETIRED: {
    key: 'retired',
    label: 'Decommissioned',
    badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    color: '#64748b',
  },
});

export const RESERVATION_STATUS = Object.freeze({
  PENDING: {
    key: 'pending',
    label: 'Pending Approval',
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  APPROVED: {
    key: 'approved',
    label: 'Approved / Ready',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  ACTIVE: {
    key: 'active',
    label: 'Active / Checked Out',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  COMPLETED: {
    key: 'completed',
    label: 'Returned & Inspected',
    badgeClass: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  },
  REJECTED: {
    key: 'rejected',
    label: 'Reservation Rejected',
    badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  },
  CANCELLED: {
    key: 'cancelled',
    label: 'Cancelled by User',
    badgeClass: 'bg-slate-600/10 text-slate-400 border border-slate-600/20',
  },
});

export const RESERVATION_POLICY = Object.freeze({
  MAX_DURATION_HOURS: 72, // 3 days max for standard student reservations
  MIN_LEAD_HOURS: 1, // Must be booked at least 1 hour ahead
  MAX_ACTIVE_PER_USER: 3, // Max active concurrent reservations per student
});
