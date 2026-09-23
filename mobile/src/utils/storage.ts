/**
 * Mobile Storage Wrapper
 * In production this wraps @react-native-async-storage/async-storage
 */

let memoryToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  return memoryToken;
}

export async function setAuthToken(token: string): Promise<void> {
  memoryToken = token;
}

export async function clearAuthToken(): Promise<void> {
  memoryToken = null;
}
