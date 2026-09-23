/**
 * Shared Validation Rules: Equipment Reservation System
 * Framework-agnostic validation functions for reservations, equipment, and date ranges
 */

import { RESERVATION_POLICY } from './constants.js';

/**
 * Validates that reservation start and end times meet institutional constraints
 */
export function isReservationIntervalValid(startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr) {
    return { valid: false, error: 'Both start and end dates/times are required.' };
  }

  const start = new Date(startTimeStr);
  const end = new Date(endTimeStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date/time format supplied.' };
  }

  const now = new Date();
  // Minimum lead time check
  const minAllowedStart = new Date(now.getTime() - 60000); // 1 minute tolerance for network lag
  if (start < minAllowedStart) {
    return { valid: false, error: 'Reservation start time cannot be in the past.' };
  }

  if (end <= start) {
    return { valid: false, error: 'Reservation end time must be after start time.' };
  }

  // Duration check
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (durationHours > RESERVATION_POLICY.MAX_DURATION_HOURS) {
    return {
      valid: false,
      error: `Reservation exceeds maximum allowable period of ${RESERVATION_POLICY.MAX_DURATION_HOURS} hours (${RESERVATION_POLICY.MAX_DURATION_HOURS / 24} days).`,
    };
  }

  return { valid: true, durationHours };
}

/**
 * Validates reservation submission payload from web or mobile clients
 */
export function validateReservationPayload(payload) {
  const errors = {};

  if (!payload.equipment_id) {
    errors.equipment_id = 'Equipment selection is required.';
  }

  if (!payload.purpose_type_id) {
    errors.purpose_type_id = 'Reservation purpose is required.';
  }

  const intervalValidation = isReservationIntervalValid(payload.start_time, payload.end_time);
  if (!intervalValidation.valid) {
    errors.interval = intervalValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
