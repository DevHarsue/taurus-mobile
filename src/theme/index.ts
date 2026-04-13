// ─── Color Tokens (extraidos del diseno Pencil) ───────────────────────────

export const colors = {
  // Brand
  primaryRed: '#930303',
  primaryDark: '#690001',

  // Backgrounds
  black: '#000000',
  white: '#FFFFFF',
  bgLight: '#F5F5F5',
  backgroundDark: '#111111',
  backgroundForm: '#FAFAFA',
  backgroundCard: '#F3F3F4',

  // Text
  textPrimary: '#1A1C1C',
  textSecondary: '#6B7280',
  textMuted: '#888888',
  textPrimaryAlpha80: '#1A1C1CCC',
  textPrimaryAlpha50: '#1A1C1C80',
  textPrimaryAlpha40: '#1A1C1C66',
  textPrimaryAlpha10: '#1A1C1C1A',

  // Status
  badgeActive: '#2A7A3A',
  badgeActiveBg: '#2A7A3A15',
  badgeExpired: '#DC2626',
  badgeExpiredBg: '#93030315',
  warning: '#F59E0B',
  sensorActive: '#2A7A3A',

  // QR
  qrBorder: '#2A7A3A',

  // Navigation
  navActive: '#DC2626',
  navInactive: '#71717A',
  navBarBg: '#000000',
  navBarActiveBg: '#18181B',

  // Misc
  divider: '#E0E0E0',
  inputBg: '#F3F3F4',
  inputBgAlt: '#EEEEEE',
} as const;

// ─── Gradient Tokens ───────────────────────────────────────────────────────

export const gradients = {
  primary: ['#690001', '#930303'] as const,
  splash: ['#2D0000', '#0A0000', '#000000'] as const,
} as const;

// ─── Typography Tokens ─────────────────────────────────────────────────────

export const typography = {
  // Lexend - Titulos y numeros
  titleXL: { fontFamily: 'Lexend_800ExtraBold', fontSize: 48, letterSpacing: 4 },
  titleL: { fontFamily: 'Lexend_800ExtraBold', fontSize: 36 },
  titleM: { fontFamily: 'Lexend_800ExtraBold', fontSize: 32 },
  titleS: { fontFamily: 'Lexend_800ExtraBold', fontSize: 28 },
  headingL: { fontFamily: 'Lexend_700Bold', fontSize: 22 },
  headingM: { fontFamily: 'Lexend_700Bold', fontSize: 20 },
  headingS: { fontFamily: 'Lexend_700Bold', fontSize: 18 },
  headingXS: { fontFamily: 'Lexend_600SemiBold', fontSize: 16 },
  statXL: { fontFamily: 'Lexend_800ExtraBold', fontSize: 42 },
  statL: { fontFamily: 'Lexend_800ExtraBold', fontSize: 36 },
  statM: { fontFamily: 'Lexend_700Bold', fontSize: 28 },

  // Inter - Cuerpo y labels
  bodyL: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  bodyM: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  bodyS: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  bodySM: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  bodyXS: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  labelL: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  labelM: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5 },
  labelS: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1 },
  caption: { fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1 },
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Border Radii ──────────────────────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
  fab: 28,
} as const;

// ─── Sizes ─────────────────────────────────────────────────────────────────

export const sizes = {
  buttonHeight: 52,
  inputHeight: 48,
  headerHeight: 56,
  tabBarHeight: 80,
  fabSize: 56,
  avatarSm: 32,
  avatarMd: 42,
  avatarLg: 48,
} as const;

// ─── Theme Aggregate ───────────────────────────────────────────────────────

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  sizes,
} as const;

export type Theme = typeof theme;
