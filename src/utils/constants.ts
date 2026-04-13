import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveDefaultApiHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const detectedHost = hostUri?.split(':')[0];

  if (detectedHost) {
    return `http://${detectedHost}`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2';
  }

  return 'http://localhost';
}

// Todos los servicios pasan por Nginx en el puerto 8080
const API_HOST = (process.env.EXPO_PUBLIC_API_HOST ?? resolveDefaultApiHost()).replace(/\/$/, '');
const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '8080';

export const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? `${API_HOST}:${API_PORT}`;
export const MEMBERS_BASE_URL = process.env.EXPO_PUBLIC_MEMBERS_BASE_URL ?? `${API_HOST}:${API_PORT}`;
export const ACCESS_BASE_URL = process.env.EXPO_PUBLIC_ACCESS_BASE_URL ?? `${API_HOST}:${API_PORT}`;

export const SECURE_STORE_KEYS = {
  accessToken: 'taurus.access_token',
  refreshToken: 'taurus.refresh_token',
} as const;
