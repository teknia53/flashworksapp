import { useColorScheme } from 'react-native';
import { getColors, type ThemeColors } from './colors';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: getColors(isDark), isDark };
}
