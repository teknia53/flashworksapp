export const palette = {
  navy: '#234488',
  navyDark: '#122244',
  navyDeep: '#0A1628',
  gold: '#C4941A',
  goldLight: '#F0D47A',
  success: '#2D8B55',
  error: '#C93B3B',
  white: '#FFFFFF',
  offWhite: '#F7F7F9',
  gray100: '#F0F0F3',
  gray200: '#E0E0E5',
  gray300: '#C0C0C8',
  gray400: '#8888A0',
  gray500: '#666680',
  gray600: '#444460',
  gray700: '#2A2A40',
  black: '#000000',
} as const;

export const lightColors = {
  background: palette.offWhite,
  surface: palette.white,
  surfaceElevated: palette.white,
  primary: palette.navy,
  primaryText: palette.white,
  accent: palette.gold,
  text: palette.navyDark,
  textSecondary: palette.gray500,
  textMuted: palette.gray400,
  greekText: palette.navyDark,
  meaningText: palette.gray600,
  border: palette.gray200,
  success: palette.success,
  error: palette.error,
  tabBar: palette.white,
  tabBarInactive: palette.gray400,
  tabBarActive: palette.navy,
  headerBackground: palette.navy,
  headerText: palette.white,
  cardShadow: 'rgba(18, 34, 68, 0.08)',
};

export const darkColors = {
  background: palette.navyDeep,
  surface: '#1A2844',
  surfaceElevated: '#223355',
  primary: palette.gold,
  primaryText: palette.navyDeep,
  accent: palette.goldLight,
  text: palette.offWhite,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
  greekText: palette.goldLight,
  meaningText: palette.gray200,
  border: '#2A3A5A',
  success: '#3DA96A',
  error: '#E05555',
  tabBar: '#0D1E38',
  tabBarInactive: palette.gray500,
  tabBarActive: palette.goldLight,
  headerBackground: '#0D1E38',
  headerText: palette.offWhite,
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryText: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  greekText: string;
  meaningText: string;
  border: string;
  success: string;
  error: string;
  tabBar: string;
  tabBarInactive: string;
  tabBarActive: string;
  headerBackground: string;
  headerText: string;
  cardShadow: string;
}

export function getColors(dark: boolean): ThemeColors {
  return dark ? darkColors : lightColors;
}
