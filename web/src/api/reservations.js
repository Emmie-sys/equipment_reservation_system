import { apiClient } from './client';

export const reservationApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/reservations${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/reservations/${id}`),
  create: (data) => apiClient('/reservations', { method: 'POST', body: data }),
  approve: (id, comments = '') => apiClient(`/reservations/${id}/approve`, { method: 'PATCH', body: { comments } }),
  reject: (id, reason) => apiClient(`/reservations/${id}/reject`, { method: 'PATCH', body: { reason } }),
  cancel: (id) => apiClient(`/reservations/${id}/cancel`, { method: 'PATCH' }),
  checkin: (id, notes = '') => apiClient(`/reservations/${id}/checkin`, { method: 'PATCH', body: { notes } }),
  checkout: (id, conditionNotes = '', notes = '') => apiClient(`/reservations/${id}/checkout`, { method: 'PATCH', body: { notes, condition_notes: conditionNotes } }),
};
