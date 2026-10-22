import { apiClient } from './client';

export const usersApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/users${qs ? `?${qs}` : ''}`);
  },
  create: (data) => apiClient('/users', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/users/${id}`, { method: 'PATCH', body: data }),
  deactivate: (id) => apiClient(`/users/${id}`, { method: 'DELETE' }),
};

export const messagesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/messages${qs ? `?${qs}` : ''}`);
  },
  compose: (data) => apiClient('/messages', { method: 'POST', body: data }),
  markRead: (id) => apiClient(`/messages/${id}/read`, { method: 'PATCH' }),
};

export const rolesApi = {
  getAll: () => apiClient('/roles'),
  create: (data) => apiClient('/roles', { method: 'POST', body: data }),
  update: (id, data) => apiClient(`/roles/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiClient(`/roles/${id}`, { method: 'DELETE' }),
};

export const settingsApi = {
  getAll: () => apiClient('/settings'),
  update: (data) => apiClient('/settings', { method: 'PATCH', body: data }),
};

export const faultyApi = {
  getAll: () => apiClient('/equipment/faulty'),
  updateStatus: (id, data) => apiClient(`/equipment/${id}/status`, { method: 'PATCH', body: data }),
};
