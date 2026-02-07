import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import type { CardFace } from '@/src/state/StudyContext';

interface StudyControlsProps {
  cardFace: CardFace;
  onReveal: () => void;
  onRight: () => void;
  onWrong: () => void;
}

export function StudyControls({ cardFace, onReveal, onRight, onWrong }: StudyControlsProps) {
  const { colors } = useTheme();

  if (cardFace === 'word') {
    return (
      <View style={styles.container}>
        <Pressable
          style={[styles.revealBtn, { backgroundColor: colors.primary }]}
          onPress={onReveal}
        >
          <Ionicons name="eye" size={24} color="#fff" />
          <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Reveal</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.answerBtn, { backgroundColor: colors.error }]}
        onPress={onWrong}
      >
        <Ionicons name="close" size={28} color="#fff" />
        <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Wrong</Text>
      </Pressable>
      <Pressable
        style={[styles.answerBtn, { backgroundColor: colors.success }]}
        onPress={onRight}
      >
        <Ionicons name="checkmark" size={28} color="#fff" />
        <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Right</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  revealBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  answerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  btnText: { color: '#fff', fontSize: 18 },
});
