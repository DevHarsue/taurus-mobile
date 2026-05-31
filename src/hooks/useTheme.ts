import { useContext } from 'react';
import { ThemeContext } from '@context/ThemeContext';

/**
 * Hook para consumir el tema activo. Devuelve `{ colors, mode, colorScheme,
 * setMode, theme }`. Las pantallas deben construir sus estilos con
 * `useMemo(() => createStyles(colors), [colors])` para que reaccionen al
 * cambio de tema.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
