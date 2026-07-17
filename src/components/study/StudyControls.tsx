import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import type { CardFace } from '@/src/state/StudyContext';

interface StudyControlsProps {
  cardFace: CardFace;
  onReveal: () => void;
  onRight: () => void;
  onWrong: () => void;
  /** Stack buttons vertically (landscape side column) */
  vertical?: boolean;
}

export function StudyControls({ cardFace, onReveal, onRight, onWrong, vertical = false }: StudyControlsProps) {
  const { colors } = useTheme();
  const containerStyle = vertical ? styles.containerVertical : styles.container;
  const btnFlex = vertical ? undefined : styles.btnFlex;

  if (cardFace === 'word') {
    return (
      <View style={containerStyle}>
        <Pressable
          style={[styles.btn, btnFlex, { backgroundColor: colors.primary }]}
          onPress={onReveal}
        >
          <Ionicons name="eye" size={24} color="#fff" />
          <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Reveal</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Pressable
        style={[styles.btn, btnFlex, { backgroundColor: colors.error }]}
        onPress={onWrong}
      >
        <Ionicons name="close" size={28} color="#fff" />
        <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Wrong</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, btnFlex, { backgroundColor: colors.success }]}
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
  containerVertical: {
    flexDirection: 'column',
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  btnFlex: { flex: 1 },
  btnText: { color: '#fff', fontSize: 18 },
});
