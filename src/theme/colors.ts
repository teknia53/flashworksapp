export const palette = {
  brown: '#0067AC',       // Teknia blue — primary actions, headers
  brownDark: '#004F85',   // Darker blue — text, app icon background
  brownDeep: '#00223A',   // Deep navy — dark mode background
  teal: '#00838F',        // Teal — accent that harmonizes with Teknia blue
  gold: '#C4941A',        // Warm gold — accent highlights
  goldLight: '#F0D47A',   // Light gold — Greek text in dark mode
  parchment: '#E8D5B5',   // Parchment — warm surface tint
  success: '#3D8B4A',     // Warm green — correct answers
  error: '#C04040',       // Red-orange — wrong answers (matches professor robe)
  white: '#FFFFFF',
  offWhite: '#FFFFFF',    // White — clean background
  gray100: '#F2EDE6',     // Warm grays throughout
  gray200: '#E2DBD1',
  gray300: '#C4BAB0',
  gray400: '#958A80',
  gray500: '#706560',
  gray600: '#504540',
  gray700: '#352E28',
  black: '#000000',
} as const;

export const lightColors = {
  background: palette.offWhite,
  surface: palette.white,
  surfaceElevated: palette.white,
  primary: palette.brown,
  primaryText: palette.white,
  accent: palette.teal,
  text: palette.brownDark,
  textSecondary: palette.gray500,
  textMuted: palette.gray400,
  greekText: palette.brownDark,
  meaningText: palette.gray600,
  border: palette.gray200,
  success: palette.success,
  error: palette.error,
  tabBar: palette.white,
  tabBarInactive: palette.gray400,
  tabBarActive: palette.brown,
  headerBackground: palette.brown,
  headerText: palette.white,
  cardShadow: 'rgba(74, 46, 31, 0.10)',
};

export const darkColors = {
  background: palette.brownDeep,
  surface: '#2A1E16',
  surfaceElevated: '#362820',
  primary: palette.gold,
  primaryText: palette.brownDeep,
  accent: palette.goldLight,
  text: palette.offWhite,
  textSecondary: palette.gray300,
  textMuted: palette.gray400,
  greekText: palette.goldLight,
  meaningText: palette.gray200,
  border: '#3E3028',
  success: '#4DA86A',
  error: '#E05555',
  tabBar: '#150E0A',
  tabBarInactive: palette.gray500,
  tabBarActive: palette.goldLight,
  headerBackground: '#150E0A',
  headerText: palette.offWhite,
  cardShadow: 'rgba(0, 0, 0, 0.35)',
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
