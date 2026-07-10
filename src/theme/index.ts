export const Colors = {
  // Primary (ZeelCloud blue)
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',

  // Primary gradient (kept for components that use it; now blue)
  gradientStart: '#2563EB',
  gradientEnd: '#1D4ED8',

  // Backgrounds
  background: '#F4F6FA',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Borders
  border: '#E5E9F0',
  borderFocus: '#2563EB',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Neutral
  neutral: '#64748B',
  neutralLight: '#F1F5F9',

  // Drawer
  drawerBg: '#2563EB',

  // Card shadow
  shadow: '#000000',

  // Accent shades (repointed from purple → blue so existing accents follow the new brand)
  purple100: '#DBEAFE',
  purple200: '#BFDBFE',
  purple500: '#3B82F6',
  purple600: '#2563EB',
  purple700: '#1D4ED8',

  // Blue shades
  blue500: '#3B82F6',
  blue600: '#2563EB',

  // Gray shades
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
