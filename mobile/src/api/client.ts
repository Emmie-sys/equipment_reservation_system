/**
 * React Native API Client
 * Parallels web/src/api/client.js with AsyncStorage token management
 */

import { getAuthToken, clearAuthToken } from '../utils/storage';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // Default Android emulator host

export async function mobileApiClient(endpoint: string, options: any = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    await clearAuthToken();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Mobile network request failed');
  }

  return data;
}
