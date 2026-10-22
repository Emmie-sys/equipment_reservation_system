import { apiClient } from './client';

export const studentsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiClient(`/students${qs ? `?${qs}` : ''}`);
  },
  getByStudentNumber: (studentNumber) => {
    return apiClient(`/students/${encodeURIComponent(studentNumber)}`);
  },
  provision: (data) => {
    return apiClient('/students', {
      method: 'POST',
      body: data,
    });
  },
};
