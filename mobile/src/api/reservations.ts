import { mobileApiClient } from './client';

export interface Reservation {
  reservation_id: number;
  requested_by_user_id: number;
  purpose_details?: string;
  submitted_at: string;
  requested_start_datetime: string;
  requested_end_datetime: string;
  status?: {
    status_id: number;
    status_name: string;
  };
  purpose_type?: {
    purpose_name: string;
  };
  items?: Array<{
    equipment?: {
      asset_tag: string;
      model?: {
        model_name: string;
      };
    };
  }>;
}

export const mobileReservationApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return mobileApiClient(`/reservations${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => mobileApiClient(`/reservations/${id}`),
  create: (data: {
    equipment_id: number;
    model_id?: number;
    purpose_type_id: number;
    purpose_details?: string;
    start_time: string;
    end_time: string;
    pickup_room_id?: number;
  }) => mobileApiClient('/reservations', { method: 'POST', body: data }),
  cancel: (id: number) => mobileApiClient(`/reservations/${id}/cancel`, { method: 'PATCH' }),
  checkin: (id: number, notes = '') =>
    mobileApiClient(`/reservations/${id}/checkin`, { method: 'PATCH', body: { notes } }),
  checkout: (id: number, conditionNotes = '', notes = '') =>
    mobileApiClient(`/reservations/${id}/checkout`, {
      method: 'PATCH',
      body: { notes, condition_notes: conditionNotes },
    }),
};
