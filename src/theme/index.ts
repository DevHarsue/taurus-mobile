// ─── Color Tokens (extraidos del diseno Pencil) ───────────────────────────
//
// Dark mode (Fase 6): los colores viven en dos paletas con LAS MISMAS claves
// (`lightColors` / `darkColors`). Las pantallas NO deben importar `colors`
// directamente para estilos dinamicos: usar `useTheme()` (de `@hooks/useTheme`)
// que devuelve la paleta activa. El `export const colors = lightColors` se
// mantiene solo como fallback / compatibilidad para codigo que aun no migra.
//
// Convencion semantica para que el dark mode funcione:
//   - `background`  → fondo de pantalla (claro u oscuro segun tema)
//   - `surface`     → fondo de cards/tarjetas
//   - `white`/`black` → SIEMPRE literales (tinta/blancos puros: texto sobre
//     botones rojos, fondo del QR, etc.). NO usar `white` como fondo de
//     pantalla: usar `background`/`surface`.

export const lightColors = {
  // Brand
  primaryRed: '#930303',
  primaryDark: '#690001',

  // Literales (no cambian con el tema)
  black: '#000000',
  white: '#FFFFFF',

  // Backgrounds (semanticos — cambian con el tema)
  background: '#FFFFFF',
  bgLight: '#F5F5F5',
  backgroundDark: '#111111',
  backgroundForm: '#FAFAFA',
  backgroundCard: '#F3F3F4',
  surface: '#F3F3F4',

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

export type Colors = Record<keyof typeof lightColors, string>;

export const darkColors: Colors = {
  // Brand (rojo de marca intacto en ambos temas)
  primaryRed: '#930303',
  primaryDark: '#690001',

  // Literales
  black: '#000000',
  white: '#FFFFFF',

  // Backgrounds (invertidos)
  background: '#121212',
  bgLight: '#181818',
  backgroundDark: '#0A0A0A',
  backgroundForm: '#1C1C1E',
  backgroundCard: '#1E1E20',
  surface: '#1E1E20',

  // Text (invertido)
  textPrimary: '#F5F5F5',
  textSecondary: '#A1A1AA',
  textMuted: '#8A8A8E',
  textPrimaryAlpha80: '#FFFFFFCC',
  textPrimaryAlpha50: '#FFFFFF80',
  textPrimaryAlpha40: '#FFFFFF66',
  textPrimaryAlpha10: '#FFFFFF1A',

  // Status (mismos acentos; los *Bg ya son alfa y funcionan sobre oscuro)
  badgeActive: '#3DA152',
  badgeActiveBg: '#2A7A3A26',
  badgeExpired: '#F05252',
  badgeExpiredBg: '#DC262626',
  warning: '#F59E0B',
  sensorActive: '#3DA152',

  // QR
  qrBorder: '#2A7A3A',

  // Navigation (la barra ya era oscura en ambos temas)
  navActive: '#DC2626',
  navInactive: '#71717A',
  navBarBg: '#000000',
  navBarActiveBg: '#18181B',

  // Misc
  divider: '#2A2A2D',
  inputBg: '#1E1E20',
  inputBgAlt: '#262629',
} as const;

export const palettes = {
  light: lightColors,
  dark: darkColors,
} as const;

/** Fallback estatico (light). Para estilos dinamicos usar `useTheme()`. */
export const colors = lightColors;

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

export type Theme = Omit<typeof theme, 'colors'> & { colors: Colors };
