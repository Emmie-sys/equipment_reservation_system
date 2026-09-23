import { apiClient } from './client';

export const studentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/students${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/students/${id}`),
  getDemeritSummary: (id) => apiClient(`/students/${id}/demerit-summary`),
  remitDemerits: (id, { points, reason }) =>
    apiClient(`/students/${id}/remit`, { method: 'POST', body: { points, reason } }),
};
