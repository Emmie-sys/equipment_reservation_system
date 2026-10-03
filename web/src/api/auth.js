import { apiClient } from './client';

export const authApi = {
  login: (credentials) => apiClient('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => apiClient('/auth/me'),
  refresh: () => apiClient('/auth/refresh', { method: 'POST' }),
  changePassword: (data) => apiClient('/auth/change-password', { method: 'POST', body: data }),
};
