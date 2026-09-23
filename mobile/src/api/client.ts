/**
 * React Native API Client
 * Uses dynamic IP detection via Expo Constants so the app always
 * connects to the correct backend regardless of network changes.
 */

import Constants from 'expo-constants';
import { getAuthToken, clearAuthToken } from '../utils/storage';

/**
 * Dynamically resolves the backend base URL.
 *
 * In Expo Go (development), hostUri is the address of the Metro bundler,
 * which runs on the same machine as the PHP backend. We extract the IP
 * from it and point port 8000 at that same host.
 *
 * Fallback chain:
 *   1. Metro bundler host (Expo Go on physical device) — fully automatic
 *   2. EXPO_PUBLIC_API_URL environment variable — set in mobile/.env
 *   3. Hardcoded LAN IP — last resort manual override
 */
function resolveBaseUrl(): string {
  // --- Priority 1: Environment variable (EXPO_PUBLIC_API_URL from mobile/.env) ---
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // --- Priority 2: Automatic from Expo Go hostUri (Metro bundler host) ---
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000/api/v1`;
    }
  }

  // --- Priority 3: Fallback extra apiUrl ---
  const envUrl = (Constants.expoConfig?.extra as any)?.apiUrl;
  if (envUrl) return envUrl;

  // --- Priority 4: Manual fallback ---
  return 'http://192.168.31.225:8000/api/v1';
}

const BASE_URL = resolveBaseUrl();

// Log the resolved URL so it's visible in the Expo terminal / Metro console
console.log(`[API] Resolved BASE_URL: ${BASE_URL}`);

export { BASE_URL };

export async function mobileApiClient(endpoint: string, options: any = {}) {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkErr: any) {
    // Provide a clear error when the device cannot reach the server at all
    throw new Error(
      `Cannot reach the server at ${BASE_URL}. ` +
      `Ensure the backend is running and your device is on the same Wi-Fi network. ` +
      `(${networkErr.message})`
    );
  }

  if (response.status === 401) {
    await clearAuthToken();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Mobile network request failed');
  }

  return data;
}
