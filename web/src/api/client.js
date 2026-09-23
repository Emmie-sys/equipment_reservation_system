/**
 * Base HTTP API Client
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export async function apiClient(endpoint, { method = 'GET', body, headers = {}, ...customConfig } = {}) {
  const token = localStorage.getItem('auth_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}
