export const colors = {
  primaryRed: '#930303',
  black: '#000000',
  white: '#FFFFFF',
  bgLight: '#F5F5F5',
  textSecondary: '#6B7280',
  badgeActive: '#16A34A',
  badgeExpired: '#DC2626',
  warning: '#F59E0B'
} as const;

export const radii = {
  sm: 8,
  md: 12
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24
} as const;

export const theme = {
  colors,
  radii,
  spacing
} as const;

export type Theme = typeof theme;