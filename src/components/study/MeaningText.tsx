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
      numberOfLines={3}
      adjustsFontSizeToFit
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { textAlign: 'center', paddingHorizontal: 16 },
});
