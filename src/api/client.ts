import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig
} from 'axios';
import { AUTH_BASE_URL, SECURE_STORE_KEYS } from '@utils/constants';
import { storage } from '@utils/storage';
import { triggerLogout } from './authEvents';
import type { RefreshResponse } from '@app-types/auth';

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function getAccessToken() {
  return storage.getItem(SECURE_STORE_KEYS.accessToken);
}

async function getRefreshToken() {
  return storage.getItem(SECURE_STORE_KEYS.refreshToken);
}

async function setAccessToken(token: string) {
  await storage.setItem(SECURE_STORE_KEYS.accessToken, token);
}

async function storeRefreshToken(token: string) {
  await storage.setItem(SECURE_STORE_KEYS.refreshToken, token);
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  const resp = await axios.post<RefreshResponse>(`${AUTH_BASE_URL}/api/auth/refresh`, {
    refreshToken,
  });

  const newAccessToken = resp.data.accessToken;
  await setAccessToken(newAccessToken);
  // Rotacion de tokens: guardar el nuevo refreshToken
  if (resp.data.refreshToken) {
    await storeRefreshToken(resp.data.refreshToken);
  }
  return newAccessToken;
}

export function createApiClient(baseURL: string): AxiosInstance {
  const api = axios.create({ baseURL });

  api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const original = error.config as RequestConfigWithRetry | undefined;
      if (!original) return Promise.reject(error);

      // Don't attempt refresh on auth endpoints
      const url = original.url ?? '';
      if (url.includes('/api/auth/login') || url.includes('/api/auth/refresh') || url.includes('/api/auth/register')) {
        return Promise.reject(error);
      }

      if (status !== 401 || original._retry) return Promise.reject(error);
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch (e) {
        await triggerLogout();
        return Promise.reject(e);
      }
    }
  );

  return api;
}