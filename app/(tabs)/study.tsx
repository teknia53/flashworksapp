import { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
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
    restartDeck,
    tick,
  } = useStudy();

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

  // Auto mode timer
  const handleAutoWordTimeout = useCallback(() => {
    reveal();
    haptics.reveal();
  }, [reveal, haptics]);

  const handleAutoMeaningTimeout = useCallback(() => {
    // In auto mode, move to next (count as "right" by default)
    answerRight();
  }, [answerRight]);

  const { remaining: autoRemaining } = useAutoTimer({
    seconds: active?.seconds ?? 3,
    isRunning: state.mode === 'auto' && !state.isComplete,
    onWordTimeout: handleAutoWordTimeout,
    onMeaningTimeout: handleAutoMeaningTimeout,
    face: state.cardFace,
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

  // ─── Idle state ─────────────────────────────────────────────
  if (state.mode === 'idle') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.idleContent}>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
            FlashWorks
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
            {state.deck.length > 0
              ? `${state.deck.length} words ready`
              : 'Loading words...'}
          </Text>

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
                style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                onPress={shuffleDeck}
              >
                <Ionicons name="shuffle" size={20} color={colors.primary} />
                <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: 'Inter-Medium' }]}>
                  Shuffle
                </Text>
              </Pressable>
            </View>
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
          <Text style={[styles.timer, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            {formatTime(state.elapsedMs)}
          </Text>
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

        {/* Auto timer bar */}
        {state.mode === 'auto' && (
          <View style={styles.autoTimerContainer}>
            <AutoTimerBar remaining={autoRemaining} total={active?.seconds ?? 3} />
          </View>
        )}

        {/* Card with swipe */}
        <View style={styles.cardContainer}>
          <SwipeableCard
            onSwipeRight={handleRight}
            onSwipeLeft={handleWrong}
            enabled={state.cardFace === 'meaning'}
          >
            {currentWord && (
              <FlashCard
                word={currentWord}
                face={state.cardFace}
                onTap={state.cardFace === 'word' ? handleReveal : () => {}}
                greekFontSize={active?.sizeOfForeign ? Math.floor(active.sizeOfForeign / 2.5) : 48}
                meaningFontSize={active?.sizeOfMeaning ? Math.floor(active.sizeOfMeaning / 2.5) : 24}
              />
            )}
          </SwipeableCard>
        </View>

        {/* Difficulty badge */}
        {currentWord && (
          <Text style={[styles.diffBadge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            Ch. {currentWord.dbChapter} · Diff {currentWord.dbDifficulty} · Freq {currentWord.dbFrequency}
          </Text>
        )}

        {/* Swipe hint */}
        {state.cardFace === 'meaning' && state.mode === 'manual' && (
          <Text style={[styles.swipeHint, { color: colors.textMuted, fontFamily: 'Inter' }]}>
            Swipe right = correct · Swipe left = wrong
          </Text>
        )}

        {/* Controls (hidden in auto mode when card showing word) */}
        {state.mode === 'manual' && (
          <StudyControls
            cardFace={state.cardFace}
            onReveal={handleReveal}
            onRight={handleRight}
            onWrong={handleWrong}
          />
        )}
        {state.mode === 'auto' && state.cardFace === 'meaning' && (
          <StudyControls
            cardFace={state.cardFace}
            onReveal={handleReveal}
            onRight={handleRight}
            onWrong={handleWrong}
          />
        )}
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
  timer: { fontSize: 14 },
  progressTrack: {
    height: 3,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  autoTimerContainer: { marginTop: spacing.sm },
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
  title: { fontSize: 32, marginBottom: spacing.sm },
  subtitle: { fontSize: 18, marginBottom: spacing['3xl'] },
  buttonGroup: {
    alignItems: 'center',
    gap: spacing.md,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 18 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 16 },
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
