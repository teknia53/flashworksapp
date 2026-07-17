import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';

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

function Stepper({
  value,
  min,
  max,
  step,
  onChange,
  enabled,
  colors,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  enabled: boolean;
  colors: any;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => enabled && onChange(Math.max(min, value - step))}
        style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <Ionicons name="remove" size={18} color={enabled ? colors.primary : colors.textMuted} />
      </Pressable>
      <Text style={[styles.stepValue, { color: colors.text, fontFamily: 'Inter-Medium' }]}>
        {value}
      </Text>
      <Pressable
        onPress={() => enabled && onChange(Math.min(max, value + step))}
        style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <Ionicons name="add" size={18} color={enabled ? colors.primary : colors.textMuted} />
      </Pressable>
    </View>
  );
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
  const isSingleValue = low === high;

  return (
    <View style={[styles.container, { opacity }]}>
      {isSingleValue ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter' }]}>{label}</Text>
          <Stepper value={low} min={min} max={max} step={step} onChange={(v) => { onLowChange(v); onHighChange(v); }} enabled={enabled} colors={colors} />
        </View>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter' }]}>{label}</Text>
          <View style={styles.row}>
            <Text style={[styles.rangeLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>Low</Text>
            <Stepper value={low} min={min} max={high} step={step} onChange={onLowChange} enabled={enabled} colors={colors} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rangeLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>High</Text>
            <Stepper value={high} min={low} max={max} step={step} onChange={onHighChange} enabled={enabled} colors={colors} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  label: { fontSize: 15, flex: 1 },
  rangeLabel: { fontSize: 14, flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 16, minWidth: 45, textAlign: 'center' },
});
