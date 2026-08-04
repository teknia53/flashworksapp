import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

interface MeaningTextProps {
  text: string;
  fontSize?: number;
}

export function MeaningText({ text, fontSize = 24 }: MeaningTextProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[styles.text, { fontSize, color: colors.meaningText, fontFamily: 'Inter' }]}
      // 4, not 3: meanings carried over from the desktop app can hold three
      // explicit line breaks, and on a phone the longest segment of παρά and
      // λοιπός wraps, needing a fourth line. At 3 those two were being shrunk.
      numberOfLines={4}
      adjustsFontSizeToFit
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', paddingHorizontal: 16 },
});
