import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { GreekText } from './GreekText';
import { MeaningText } from './MeaningText';
import type { FlashWord } from '@/src/db/types';
import type { CardFace } from '@/src/state/StudyContext';

interface FlashCardProps {
  word: FlashWord;
  face: CardFace;
  onTap: () => void;
  greekFontSize?: number;
  meaningFontSize?: number;
}

export function FlashCard({
  word,
  face,
  onTap,
  greekFontSize = 48,
  meaningFontSize = 24,
}: FlashCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onTap} style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
      <View style={styles.content}>
        <GreekText text={word.dbWord} baseFontSize={greekFontSize} />
        {face === 'meaning' && (
          <View style={styles.meaningContainer}>
            <MeaningText text={word.dbMeaning} fontSize={meaningFontSize} />
            {word.dbPrincipalParts ? (
              <MeaningText text={word.dbPrincipalParts} fontSize={Math.floor(meaningFontSize * 0.75)} />
            ) : null}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 300,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  meaningContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
