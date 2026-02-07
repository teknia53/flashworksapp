import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/src/theme';

interface ErrorListItemProps {
  word: string;
  meaning: string;
  index: number;
}

export function ErrorListItem({ word, meaning, index }: ErrorListItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.index, { color: colors.textMuted, fontFamily: 'Inter' }]}>
        {index + 1}
      </Text>
      <View style={styles.textContainer}>
        <Text
          style={[styles.word, { color: colors.greekText, fontFamily: 'GentiumPlus' }]}
          numberOfLines={1}
        >
          {word}
        </Text>
        <Text
          style={[styles.meaning, { color: colors.meaningText, fontFamily: 'Inter' }]}
          numberOfLines={1}
        >
          {meaning}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  index: { fontSize: 14, width: 24, textAlign: 'center' },
  textContainer: { flex: 1 },
  word: { fontSize: 20, marginBottom: 2 },
  meaning: { fontSize: 14 },
});
