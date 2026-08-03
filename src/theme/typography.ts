// Greek is set in Tinos, bundled in assets/fonts/. Tinos is metrically
// compatible with Times New Roman and carries full polytonic coverage, so Greek
// renders identically on iOS and Android instead of falling back to whatever
// serif each platform happens to ship. Loaded in app/_layout.tsx.
export const fontFamilies = {
  greek: 'Tinos',
  // No bold face is bundled — this resolves to regular Tinos. Add
  // Tinos-Bold.ttf and load it in app/_layout.tsx if real bold Greek is needed.
  greekBold: 'Tinos',
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
