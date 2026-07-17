import { Platform } from 'react-native';

export const fontFamilies = {
  greek: Platform.select({
    ios: 'Times New Roman',
    android: 'serif',
    default: 'Times New Roman',
  }),
  greekBold: Platform.select({
    ios: 'Times New Roman',
    android: 'serif',
    default: 'Times New Roman',
  }),
  ui: 'Inter',
  uiMedium: 'Inter-Medium',
  uiBold: 'Inter-Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;
