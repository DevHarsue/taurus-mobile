import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { SECURE_STORE_KEYS } from '@utils/constants';
import { storage } from '@utils/storage';
import { decodeJwtPayload } from '@utils/jwt';
import type { AuthUser, JwtPayload, LoginRequest } from '@app-types/auth';
import * as authApi from '@api/auth.api';
import { setLogoutHandler } from '@api/authEvents';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    storage.getItem(SECURE_STORE_KEYS.accessToken),
    storage.getItem(SECURE_STORE_KEYS.refreshToken),
  ]);
  return { accessToken, refreshToken };
}

async function writeTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    storage.setItem(SECURE_STORE_KEYS.accessToken, accessToken),
    storage.setItem(SECURE_STORE_KEYS.refreshToken, refreshToken),
  ]);
}

async function clearTokens() {
  await Promise.all([
    storage.deleteItem(SECURE_STORE_KEYS.accessToken),
    storage.deleteItem(SECURE_STORE_KEYS.refreshToken),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = useCallback(async () => {
    // Llamar al backend para revocar el refreshToken
    try {
      const refreshToken = await storage.getItem(SECURE_STORE_KEYS.refreshToken);
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Si falla la llamada al backend, seguimos limpiando localmente
    }
    await clearTokens();
    setUser(null);
    setAccessToken(null);
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const resp = await authApi.login(body);
    await writeTokens(resp.accessToken, resp.refreshToken);
    setAccessToken(resp.accessToken);

    // Role del JWT payload (sin llamada extra al backend)
    const payload = decodeJwtPayload<JwtPayload>(resp.accessToken);
    const role = payload?.role ?? resp.user.role;
    setUser({ ...resp.user, role });
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
    return () => setLogoutHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { accessToken: storedAccess } = await readTokens();
        if (!storedAccess) {
          if (!cancelled) {
            setAccessToken(null);
            setUser(null);
          }
          return;
        }

        if (!cancelled) setAccessToken(storedAccess);

        // Validar token con backend (auto-refresh en 401 via interceptor)
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) await logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [logout]);

  const isAuthenticated = !!accessToken;
  const isAdmin =
    user?.role === 'admin' ||
    decodeJwtPayload<JwtPayload>(accessToken ?? '')?.role === 'admin';

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
    }),
    [user, loading, isAuthenticated, isAdmin, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
