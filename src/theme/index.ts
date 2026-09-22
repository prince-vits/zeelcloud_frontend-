export const Colors = {
  // Brand trio (logo) — use each deliberately, not as a blend
  // #424096 dark indigo | #9C8DCE light indigo | #FFFFFF white
  primary: '#424096',
  primaryDark: '#2D2B6B',
  primaryLight: '#9C8DCE',

  // Legacy aliases (solid fills only — do not blend these in gradients)
  gradientStart: '#424096',
  gradientEnd: '#9C8DCE',

  // Canvas: soft lavender wash so light indigo shows without darkening the app
  background: '#EEEAF6',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#2A2758',
  textSecondary: '#6B648F',
  textMuted: '#9A93B5',
  textWhite: '#FFFFFF',

  // Borders — indigo-tinted neutrals
  border: '#D8D2E8',
  borderFocus: '#424096',

  // Status (unchanged semantics)
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#424096',
  infoLight: '#E8E3F4',

  // Neutral
  neutral: '#6B648F',
  neutralLight: '#F3F0FA',

  // Drawer / chrome
  drawerBg: '#424096',

  shadow: '#000000',

  // Accent scale (monochrome indigo)
  purple100: '#E8E3F4',
  purple200: '#D4CBE8',
  purple500: '#9C8DCE',
  purple600: '#424096',
  purple700: '#2D2B6B',

  blue500: '#9C8DCE',
  blue600: '#424096',

  // Gray scale (slightly cool-indigo so UI stays on-brand)
  gray50: '#F7F5FB',
  gray100: '#F0ECF7',
  gray200: '#E2DCEC',
  gray300: '#CBC3DB',
  gray400: '#9A93B5',
  gray500: '#6B648F',
  gray600: '#4F4A72',
  gray700: '#3A3660',
  gray800: '#2A2758',
  gray900: '#1A1838',
};

export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#424096',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sm: {
    shadowColor: '#424096',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: '#424096',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
