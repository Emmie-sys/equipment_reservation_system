import { mobileApiClient } from './client';

export const mobileIncidentsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return mobileApiClient(`/incidents${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => mobileApiClient(`/incidents/${id}`),
  create: (data: any) => mobileApiClient('/incidents', { method: 'POST', body: data }),
};
