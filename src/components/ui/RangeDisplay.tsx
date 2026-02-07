import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, spacing } from '@/src/theme';

interface RangeDisplayProps {
  label: string;
  low: number;
  high: number;
  min: number;
  max: number;
  step?: number;
  onLowChange: (val: number) => void;
  onHighChange: (val: number) => void;
  enabled?: boolean;
}

export function RangeDisplay({
  label,
  low,
  high,
  min,
  max,
  step = 1,
  onLowChange,
  onHighChange,
  enabled = true,
}: RangeDisplayProps) {
  const { colors } = useTheme();
  const opacity = enabled ? 1 : 0.4;

  return (
    <View style={[styles.container, { opacity }]}>
      <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter' }]}>{label}</Text>
      <View style={styles.rangeRow}>
        <Text style={[styles.value, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
          {low}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={low}
          onValueChange={onLowChange}
          disabled={!enabled}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>
      <View style={styles.rangeRow}>
        <Text style={[styles.value, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
          {high}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={high}
          onValueChange={onHighChange}
          disabled={!enabled}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.sm },
  label: { fontSize: 16, marginBottom: spacing.xs },
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 14, width: 50, textAlign: 'right', marginRight: spacing.sm },
  slider: { flex: 1, height: 40 },
});
