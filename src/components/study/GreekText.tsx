import { Text, View, StyleSheet } from 'react-native';
import { useTheme, fontFamilies } from '@/src/theme';
import { useDynamicFontSize } from '@/src/hooks/useDynamicFontSize';

interface GreekTextProps {
  text: string;
  baseFontSize?: number;
  /**
   * useDynamicFontSize guesses width as 0.55em per character, which is wrong in
   * both directions: the widest word in the bundled database averages 0.43em, so
   * the guess shrinks it needlessly, while some short words average 0.66em. Pass
   * false when the caller has already sized against the real worst case — iOS's
   * own adjustsFontSizeToFit still guarantees nothing overflows, including any
   * longer words a user adds later.
   */
  autoShrink?: boolean;
}

export function GreekText({ text, baseFontSize = 48, autoShrink = true }: GreekTextProps) {
  const { colors } = useTheme();
  const { fontSize, onLayout } = useDynamicFontSize(text, baseFontSize);

  return (
    <View style={styles.container} onLayout={autoShrink ? onLayout : undefined}>
      <Text
        style={[
          styles.text,
          {
            fontSize: autoShrink ? fontSize : baseFontSize,
            color: colors.greekText,
            fontFamily: fontFamilies.greek,
          },
        ]}
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
