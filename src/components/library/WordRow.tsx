import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing } from '@/src/theme';
import type { FlashWord } from '@/src/db/types';
import { WORD_TYPE_LABELS } from '@/src/db/types';

interface WordRowProps {
  word: FlashWord;
  onPress: () => void;
}

export function WordRow({ word, onPress }: WordRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <Text
          style={[styles.greek, { color: colors.greekText, fontFamily: 'Times New Roman' }]}
          numberOfLines={1}
        >
          {word.dbWord}
        </Text>
        <Text
          style={[styles.meaning, { color: colors.meaningText, fontFamily: 'Inter' }]}
          numberOfLines={1}
        >
          {word.dbMeaning}
        </Text>
      </View>
      <View style={styles.right}>
        <View style={styles.badges}>
          <Text style={[styles.badge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            Ch.{word.dbChapter}
          </Text>
          <Text style={[styles.badge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            {WORD_TYPE_LABELS[word.dbType]}
          </Text>
          <Text style={[styles.badge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            D{word.dbDifficulty}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flex: 1 },
  greek: { fontSize: 22, marginBottom: 2 },
  meaning: { fontSize: 14 },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badges: { flexDirection: 'row', gap: spacing.xs },
  badge: { fontSize: 11 },
});
