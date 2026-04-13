// Configurable via Expo env vars. Example (.env):
// EXPO_PUBLIC_API_HOST=http://192.168.1.10
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'http://localhost';

export const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? `${API_HOST}:3000`;
export const MEMBERS_BASE_URL = process.env.EXPO_PUBLIC_MEMBERS_BASE_URL ?? `${API_HOST}:3001`;
export const ACCESS_BASE_URL = process.env.EXPO_PUBLIC_ACCESS_BASE_URL ?? `${API_HOST}:3002`;

export const SECURE_STORE_KEYS = {
  accessToken: 'taurus.access_token',
  refreshToken: 'taurus.refresh_token'
} as const;