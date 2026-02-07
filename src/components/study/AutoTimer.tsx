import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme, spacing } from '@/src/theme';

interface AutoTimerProps {
  remaining: number;
  total: number;
}

export function AutoTimerBar({ remaining, total }: AutoTimerProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(remaining / total);

  useEffect(() => {
    progress.value = withTiming(remaining / total, { duration: 900 });
  }, [remaining, total]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, barStyle]} />
      </View>
      <Text style={[styles.text, { color: colors.textMuted, fontFamily: 'Inter' }]}>
        {remaining}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  text: { fontSize: 14, width: 30, textAlign: 'right' },
});
