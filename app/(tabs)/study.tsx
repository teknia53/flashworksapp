import { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, useWindowDimensions, Image, Animated, Easing } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { useDatabase } from '@/src/state/DatabaseContext';
import { useStudy } from '@/src/state/StudyContext';
import { usePreferences } from '@/src/state/PreferencesContext';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useAutoTimer } from '@/src/hooks/useAutoTimer';
import { FlashCard } from '@/src/components/study/FlashCard';
import { StudyControls } from '@/src/components/study/StudyControls';
import { SwipeableCard } from '@/src/components/study/SwipeableCard';
import { AutoTimerBar } from '@/src/components/study/AutoTimer';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function StudyScreen() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { isReady } = useDatabase();
  const { active } = usePreferences();
  const haptics = useHaptics();
  const {
    state,
    currentWord,
    loadDeck,
    startManual,
    startAuto,
    reveal,
    answerRight,
    answerWrong,
    shuffleDeck,
    stopSession,
    restartDeck,
    loadMissedDeck,
    getMissedCount,
    tick,
  } = useStudy();

  // Persisted missed-word count, refreshed whenever the idle screen shows
  const [missedCount, setMissedCount] = useState(0);
  useEffect(() => {
    if (isReady && state.mode === 'idle') {
      getMissedCount().then(setMissedCount);
    }
  }, [isReady, state.mode, state.deckSource, getMissedCount]);

  // Session timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.mode !== 'idle' && !state.isComplete) {
      timerRef.current = setInterval(() => tick(1000), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.mode, state.isComplete, tick]);

  // Auto mode timer — only auto-reveals, right/wrong is always manual
  const handleAutoTimeout = useCallback(() => {
    reveal();
    haptics.reveal();
  }, [reveal, haptics]);

  const { remaining: autoRemaining } = useAutoTimer({
    seconds: active?.seconds ?? 3,
    isRunning: state.mode === 'auto' && !state.isComplete && state.cardFace === 'word',
    onTimeout: handleAutoTimeout,
  });

  // Load deck when ready
  useEffect(() => {
    if (isReady && active) {
      loadDeck();
    }
  }, [isReady, active]);

  const handleStartManual = useCallback(() => {
    if (state.deck.length === 0) {
      loadDeck().then(() => startManual());
    } else {
      startManual();
    }
  }, [state.deck.length, loadDeck, startManual]);

  const handleStartAuto = useCallback(() => {
    if (state.deck.length === 0) {
      loadDeck().then(() => startAuto());
    } else {
      startAuto();
    }
  }, [state.deck.length, loadDeck, startAuto]);

  const handleReveal = useCallback(() => {
    reveal();
    haptics.reveal();
  }, [reveal, haptics]);

  const handleRight = useCallback(() => {
    haptics.right();
    answerRight();
  }, [answerRight, haptics]);

  const handleWrong = useCallback(() => {
    haptics.wrong();
    answerWrong();
  }, [answerWrong, haptics]);

  // Shuffle feedback: haptic tap + a wipe sweeping across the button
  const shuffleWipe = useRef(new Animated.Value(0)).current;
  const handleShuffle = useCallback(() => {
    haptics.tap();
    shuffleDeck();
    shuffleWipe.setValue(0);
    Animated.timing(shuffleWipe, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [haptics, shuffleDeck, shuffleWipe]);

  // ─── Idle state ─────────────────────────────────────────────
  if (state.mode === 'idle') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.idleContent, isLandscape && styles.idleContentLandscape]}>
          <View style={styles.idleTextBlock}>
            <Text
              style={[styles.title, { color: colors.text, fontFamily: 'Inter-Bold' }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              FlashWorks
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
              {state.deck.length === 0
                ? 'Loading words...'
                : state.deckSource === 'missed'
                  ? `${state.deck.length} missed ${state.deck.length === 1 ? 'word' : 'words'} loaded`
                  : `${state.deck.length} words ready`}
            </Text>
            {isLandscape && (
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.professorLandscape}
                resizeMode="contain"
              />
            )}
          </View>

          {state.deck.length > 0 && (
            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleStartManual}
              >
                <Ionicons name="hand-left" size={22} color="#fff" />
                <Text style={[styles.startBtnText, { fontFamily: 'Inter-Bold' }]}>Manual</Text>
              </Pressable>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.accent }]}
                onPress={handleStartAuto}
              >
                <Ionicons name="timer" size={22} color="#fff" />
                <Text style={[styles.startBtnText, { fontFamily: 'Inter-Bold' }]}>
                  Auto ({active?.seconds ?? 3}s)
                </Text>
              </Pressable>
              <Pressable
                style={[styles.secondaryBtn, styles.shuffleBtn, { borderColor: colors.primary }]}
                onPress={handleShuffle}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: colors.primary,
                      opacity: shuffleWipe.interpolate({
                        inputRange: [0, 0.1, 0.9, 1],
                        outputRange: [0, 0.25, 0.25, 0],
                      }),
                      transform: [
                        {
                          translateX: shuffleWipe.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-240, 240],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Ionicons name="shuffle" size={20} color={colors.primary} />
                <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: 'Inter-Medium' }]}>
                  Shuffle
                </Text>
              </Pressable>
              {state.deckSource !== 'missed' && missedCount > 0 && (
                <Pressable
                  style={[styles.secondaryBtn, { borderColor: colors.error }]}
                  onPress={loadMissedDeck}
                >
                  <Ionicons name="repeat" size={20} color={colors.error} />
                  <Text style={[styles.secondaryBtnText, { color: colors.error, fontFamily: 'Inter-Medium' }]}>
                    Review Missed ({missedCount})
                  </Text>
                </Pressable>
              )}
              {state.deckSource === 'missed' && (
                <Pressable
                  style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                  onPress={loadDeck}
                >
                  <Ionicons name="albums" size={20} color={colors.primary} />
                  <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: 'Inter-Medium' }]}>
                    All Words
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {!isLandscape && (
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={styles.professor}
              resizeMode="contain"
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ─── Complete state ─────────────────────────────────────────
  if (state.isComplete) {
    const accuracy = state.sessionTotal > 0
      ? Math.round(((state.sessionTotal - state.sessionErrors) / state.sessionTotal) * 100)
      : 0;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.completeContent}>
          <Ionicons name="trophy" size={64} color={colors.accent} />
          <Text style={[styles.completeTitle, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
            Session Complete
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
                {state.sessionTotal}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
                Words
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error, fontFamily: 'Inter-Bold' }]}>
                {state.sessionErrors}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
                Errors
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
                {accuracy}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
                Accuracy
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
                {formatTime(state.elapsedMs)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
                Time
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={restartDeck}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={[styles.startBtnText, { fontFamily: 'Inter-Bold' }]}>Study Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Active study state ─────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.modeBadge, { backgroundColor: state.mode === 'auto' ? colors.accent : colors.primary }]}>
              <Text style={[styles.modeBadgeText, { fontFamily: 'Inter-Bold' }]}>
                {state.mode === 'auto' ? 'AUTO' : 'MANUAL'}
              </Text>
            </View>
            <Text style={[styles.counter, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
              {state.currentIndex + 1} / {state.deck.length}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.timer, { color: colors.textMuted, fontFamily: 'Inter' }]}>
              {formatTime(state.elapsedMs)}
            </Text>
            <Pressable
              onPress={stopSession}
              style={[styles.stopBtn, { borderColor: colors.error }]}
            >
              <Ionicons name="stop" size={14} color={colors.error} />
              <Text style={[styles.stopBtnText, { color: colors.error, fontFamily: 'Inter-Medium' }]}>
                Stop
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((state.currentIndex + 1) / state.deck.length) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Auto timer bar — only shows while counting down to reveal */}
        {state.mode === 'auto' && state.cardFace === 'word' && (
          <View style={styles.autoTimerContainer}>
            <AutoTimerBar remaining={autoRemaining} total={active?.seconds ?? 3} />
          </View>
        )}

        <View style={[styles.body, isLandscape && styles.bodyLandscape]}>
          <View style={styles.cardColumn}>
            {/* Card with swipe */}
            <View style={styles.cardContainer}>
              <SwipeableCard
                // While the Greek is showing, a swipe either way just reveals the
                // meaning — same as tapping the card or the Reveal button. You can
                // only mark yourself right or wrong once you've seen the answer.
                // Auto mode keeps swipes disabled until its timer reveals the card.
                onSwipeRight={state.cardFace === 'word' ? handleReveal : handleRight}
                onSwipeLeft={state.cardFace === 'word' ? handleReveal : handleWrong}
                enabled={state.cardFace === 'meaning' || state.mode === 'manual'}
              >
                {currentWord && (
                  <FlashCard
                    word={currentWord}
                    face={state.cardFace}
                    onTap={state.cardFace === 'word' ? handleReveal : () => {}}
                    greekFontSize={active?.sizeOfForeign ? Math.floor(active.sizeOfForeign / (isLandscape ? 1.7 : 2.5)) : isLandscape ? 70 : 48}
                    meaningFontSize={active?.sizeOfMeaning ? Math.floor(active.sizeOfMeaning / (isLandscape ? 1.9 : 2.5)) : isLandscape ? 32 : 24}
                    minHeight={isLandscape ? 210 : 300}
                  />
                )}
              </SwipeableCard>
            </View>

            {/* Difficulty badge */}
            {currentWord && (
              <Text style={[styles.diffBadge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
                {currentWord.dbChapter !== 99 ? `Chapter ${currentWord.dbChapter} · ` : ''}Difficulty {currentWord.dbDifficulty} · Frequency {currentWord.dbFrequency}
              </Text>
            )}

            {/* Swipe hint */}
            {state.cardFace === 'meaning' && state.mode === 'manual' && (
              <Text style={[styles.swipeHint, { color: colors.textMuted, fontFamily: 'Inter' }]}>
                Swipe right = correct · Swipe left = wrong
              </Text>
            )}

            {/* Portrait: controls under the card */}
            {!isLandscape && state.mode === 'manual' && (
              <StudyControls
                cardFace={state.cardFace}
                onReveal={handleReveal}
                onRight={handleRight}
                onWrong={handleWrong}
              />
            )}
            {!isLandscape && state.mode === 'auto' && state.cardFace === 'meaning' && (
              <StudyControls
                cardFace="meaning"
                onReveal={handleReveal}
                onRight={handleRight}
                onWrong={handleWrong}
              />
            )}
          </View>

          {/* Landscape: controls stacked down the right side */}
          {isLandscape && (
            <View style={styles.sideControls}>
              {state.mode === 'manual' && (
                <StudyControls
                  vertical
                  cardFace={state.cardFace}
                  onReveal={handleReveal}
                  onRight={handleRight}
                  onWrong={handleWrong}
                />
              )}
              {state.mode === 'auto' && state.cardFace === 'meaning' && (
                <StudyControls
                  vertical
                  cardFace="meaning"
                  onReveal={handleReveal}
                  onRight={handleRight}
                  onWrong={handleWrong}
                />
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  modeBadgeText: { color: '#fff', fontSize: 11, letterSpacing: 0.5 },
  counter: { fontSize: 16 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timer: { fontSize: 14 },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
  },
  stopBtnText: { fontSize: 12 },
  progressTrack: {
    height: 3,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  autoTimerContainer: { marginTop: spacing.sm },
  body: { flex: 1 },
  bodyLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardColumn: { flex: 1, alignSelf: 'stretch' },
  sideControls: {
    width: 210,
    justifyContent: 'center',
    paddingRight: spacing.lg,
    paddingLeft: spacing.sm,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  diffBadge: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  // Idle
  idleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  idleContentLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  idleTextBlock: { alignItems: 'center' },
  title: { fontSize: 60, width: 240, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 18, marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  professor: {
    width: 225,
    height: 225,
    marginTop: spacing.xl,
  },
  professorLandscape: {
    width: 165,
    height: 165,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    width: 240,
    justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 18 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    width: 240,
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16 },
  shuffleBtn: { overflow: 'hidden' },
  // Complete
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  completeTitle: { fontSize: 28 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28 },
  statLabel: { fontSize: 13, marginTop: spacing.xs },
});
