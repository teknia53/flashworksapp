import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
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
  minHeight?: number;
  /** See GreekText — pass false when the caller has sized for the worst-case word. */
  autoShrinkGreek?: boolean;
}

export function FlashCard({
  word,
  face,
  onTap,
  greekFontSize = 48,
  meaningFontSize = 24,
  minHeight = 300,
  autoShrinkGreek = true,
}: FlashCardProps) {
  const { colors } = useTheme();
  const flipProgress = useSharedValue(0);

  useEffect(() => {
    flipProgress.value = withTiming(face === 'meaning' ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [face]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]),
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]),
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  return (
    <Pressable onPress={onTap} style={[styles.wrapper, { minHeight }]}>
      {/* Front face (word only) */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surface, shadowColor: colors.cardShadow, minHeight },
          frontStyle,
        ]}
      >
        <View style={styles.content}>
          <GreekText text={word.dbWord} baseFontSize={greekFontSize} autoShrink={autoShrinkGreek} />
        </View>
      </Animated.View>

      {/* Back face (word + meaning) */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { backgroundColor: colors.surface, shadowColor: colors.cardShadow, minHeight },
          backStyle,
        ]}
      >
        <View style={styles.content}>
          <GreekText
            text={word.dbWord}
            baseFontSize={Math.floor(greekFontSize * 0.85)}
            autoShrink={autoShrinkGreek}
          />
          <View style={styles.divider} />
          <MeaningText text={word.dbMeaning} fontSize={meaningFontSize} />
          {word.dbPrincipalParts ? (
            <MeaningText
              text={word.dbPrincipalParts}
              fontSize={Math.floor(meaningFontSize * 0.7)}
            />
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    // Back card is absolutely positioned on top
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: spacing.lg,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderRadius: 1,
  },
});
