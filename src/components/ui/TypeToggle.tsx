import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import type { WordType } from '@/src/db/types';
import { WORD_TYPE_LABELS } from '@/src/db/types';

interface TypeToggleProps {
  enabledTypes: WordType[];
  onToggle: (type: WordType) => void;
  enabled?: boolean;
}

export function TypeToggle({ enabledTypes, onToggle, enabled = true }: TypeToggleProps) {
  const { colors } = useTheme();
  const types: WordType[] = ['N', 'V', 'A', 'P', 'O', 'S', 'G'];
  const opacity = enabled ? 1 : 0.4;

  return (
    <View style={[styles.container, { opacity }]}>
      <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter' }]}>
        Word Types
      </Text>
      <View style={styles.grid}>
        {types.map((t) => {
          const active = enabledTypes.includes(t);
          return (
            <Pressable
              key={t}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => enabled && onToggle(t)}
              disabled={!enabled}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? colors.primaryText : colors.textSecondary,
                    fontFamily: 'Inter-Medium',
                  },
                ]}
              >
                {WORD_TYPE_LABELS[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.sm },
  label: { fontSize: 16, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 14 },
});
