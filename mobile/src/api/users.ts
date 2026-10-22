import { mobileApiClient } from './client';

export interface MobileUser {
  user_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone_number?: string;
  student_number?: string;
  account_status: string;
  roles?: string[];
  created_at?: string;
}

export interface MobileMessage {
  message_id: number;
  sender_user_id: number;
  recipient_user_id?: number;
  subject: string;
  body: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export const mobileUsersApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return mobileApiClient(`/users${query ? `?${query}` : ''}`);
  },
  create: (data: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    password?: string;
    phone_number?: string;
    student_number?: string;
    role?: string;
  }) => mobileApiClient('/users', { method: 'POST', body: data }),
  update: (id: number, data: any) => mobileApiClient(`/users/${id}`, { method: 'PATCH', body: data }),
  deactivate: (id: number) => mobileApiClient(`/users/${id}`, { method: 'DELETE' }),
  getRoles: () => mobileApiClient('/roles'),
  createRole: (data: any) => mobileApiClient('/roles', { method: 'POST', body: data }),
  getSettings: () => mobileApiClient('/settings'),
  updateSettings: (data: any) => mobileApiClient('/settings', { method: 'PATCH', body: data }),
};

export const mobileMessagesApi = {
  getAll: (type = 'inbox') => mobileApiClient(`/messages?type=${type}`),
  send: (data: {
    recipient_user_id?: number | null;
    subject: string;
    body: string;
    message_type?: string;
  }) => mobileApiClient('/messages', { method: 'POST', body: data }),
  markRead: (id: number) => mobileApiClient(`/messages/${id}/read`, { method: 'PATCH' }),
};
