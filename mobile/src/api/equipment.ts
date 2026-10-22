import { mobileApiClient } from './client';

export interface Equipment {
  equipment_id: number;
  model_id: number;
  asset_tag: string;
  serial_number?: string;
  condition_notes?: string;
  is_bookable: boolean;
  status?: {
    status_id: number;
    status_name: string;
  };
  model?: {
    model_name: string;
    manufacturer: string;
    category?: {
      category_name: string;
    };
  };
  room?: {
    room_code: string;
    building?: {
      building_name: string;
    };
  };
}

export const mobileEquipmentApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return mobileApiClient(`/equipment${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => mobileApiClient(`/equipment/${id}`),
  checkAvailability: (id: number, startTime: string, endTime: string) => {
    const query = new URLSearchParams({ start_time: startTime, end_time: endTime }).toString();
    return mobileApiClient(`/equipment/${id}/availability?${query}`);
  },
  getFaulty: () => mobileApiClient('/equipment/faulty'),
  updateStatus: (id: number, data: { status: string; condition_notes?: string; is_bookable?: boolean }) =>
    mobileApiClient(`/equipment/${id}/status`, { method: 'PATCH', body: data }),
  create: (data: any) => mobileApiClient('/equipment', { method: 'POST', body: data }),
  update: (id: number, data: any) => mobileApiClient(`/equipment/${id}`, { method: 'PATCH', body: data }),
  delete: (id: number) => mobileApiClient(`/equipment/${id}`, { method: 'DELETE' }),
};
