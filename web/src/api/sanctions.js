import { apiClient } from './client';

export const sanctionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/sanctions${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/sanctions/${id}`),
  create: (data) => apiClient('/sanctions', { method: 'POST', body: data }),
  complete: (id, notes) => 
    apiClient(`/sanctions/${id}/complete`, { method: 'PATCH', body: { completion_notes: notes } }),
  appeal: (id, reason) =>
    apiClient(`/sanctions/${id}/appeal`, { method: 'POST', body: { appeal_reason: reason } }),
};
