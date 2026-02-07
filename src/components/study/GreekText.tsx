import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import { useDynamicFontSize } from '@/src/hooks/useDynamicFontSize';

interface GreekTextProps {
  text: string;
  baseFontSize?: number;
}

export function GreekText({ text, baseFontSize = 48 }: GreekTextProps) {
  const { colors } = useTheme();
  const { fontSize, onLayout } = useDynamicFontSize(text, baseFontSize);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Text
        style={[styles.text, { fontSize, color: colors.greekText, fontFamily: 'GentiumPlus' }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', paddingHorizontal: 16 },
  text: { textAlign: 'center', lineHeight: undefined },
});
