import { apiClient } from './client';

export const equipmentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/equipment${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient(`/equipment/${id}`),
  checkAvailability: (id, startTime, endTime) => {
    const query = new URLSearchParams({ start_time: startTime, end_time: endTime }).toString();
    return apiClient(`/equipment/${id}/availability?${query}`);
  },
  create: (data) => apiClient('/equipment', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/equipment/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiClient(`/equipment/${id}`, { method: 'DELETE' }),
};
