import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  palettes,
  theme as baseTheme,
  type Colors,
  type Theme,
} from '@theme/index';
import { storage } from '@utils/storage';

/**
 * Tema claro/oscuro (Fase 6).
 *
 * - `mode`: preferencia del usuario ('light' | 'dark' | 'system').
 * - `colorScheme`: el esquema REAL resuelto ('light' | 'dark'); cuando
 *   `mode === 'system'` sigue al `useColorScheme()` del SO.
 * - `colors`: la paleta activa (cambia dinamicamente al togglear el modo).
 * - Persistencia con `storage` (SecureStore en nativo / localStorage en web),
 *   igual que los tokens de auth.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-mode';

type ThemeContextValue = {
  theme: Theme;
  colors: Colors;
  mode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Cargar preferencia persistida al montar.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await storage.getItem(STORAGE_KEY);
        if (!cancelled && isThemeMode(saved)) {
          setModeState(saved);
        }
      } catch {
        // Si falla la lectura, se mantiene 'system'.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void storage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const colorScheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const colors = palettes[colorScheme];

  const theme = useMemo<Theme>(() => ({ ...baseTheme, colors }), [colors]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, colors, mode, colorScheme, setMode }),
    [theme, colors, mode, colorScheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
