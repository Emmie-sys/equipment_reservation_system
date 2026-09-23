import { apiClient } from './client';

export const incidentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/incidents${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/incidents/${id}`),
  create: (data) => apiClient('/incidents', { method: 'POST', body: data }),
  updateStatus: (id, { status, notes }) => 
    apiClient(`/incidents/${id}/status`, { method: 'PATCH', body: { status, notes } }),
};
