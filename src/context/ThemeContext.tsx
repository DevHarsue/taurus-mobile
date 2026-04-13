import React, { createContext, useMemo, useState } from 'react';
import { theme, type Theme } from '@theme/index';

type ThemeContextValue = {
  theme: Theme;
  // Reserved for future dark mode support
  colorScheme: 'light';
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme] = useState<'light'>('light');

  const value = useMemo(
    () => ({
      theme,
      colorScheme
    }),
    [colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}