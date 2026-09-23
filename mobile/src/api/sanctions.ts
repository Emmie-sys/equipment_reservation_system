import { mobileApiClient } from './client';

export const mobileSanctionsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return mobileApiClient(`/sanctions${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => mobileApiClient(`/sanctions/${id}`),
};
