import { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { useDatabase } from '@/src/state/DatabaseContext';
import { useStudy } from '@/src/state/StudyContext';
import { usePreferences } from '@/src/state/PreferencesContext';
import { FlashCard } from '@/src/components/study/FlashCard';
import { StudyControls } from '@/src/components/study/StudyControls';

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
  const {
    state,
    currentWord,
    loadDeck,
    startManual,
    reveal,
    answerRight,
    answerWrong,
    shuffleDeck,
    restartDeck,
    tick,
  } = useStudy();

  // Timer
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

  // Load deck when ready
  useEffect(() => {
    if (isReady && active) {
      loadDeck();
    }
  }, [isReady, active]);

  const handleStartStudy = useCallback(() => {
    if (state.deck.length === 0) {
      loadDeck().then(() => startManual());
    } else {
      startManual();
    }
  }, [state.deck.length, loadDeck, startManual]);

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
            <>
              <Pressable
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={handleStartStudy}
              >
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={[styles.startBtnText, { fontFamily: 'Inter-Bold' }]}>
                  Start Study
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
            </>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.counter, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
          {state.currentIndex + 1} / {state.deck.length}
        </Text>
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

      {/* Card */}
      <View style={styles.cardContainer}>
        {currentWord && (
          <FlashCard
            word={currentWord}
            face={state.cardFace}
            onTap={state.cardFace === 'word' ? reveal : () => {}}
            greekFontSize={active?.sizeOfForeign ? Math.floor(active.sizeOfForeign / 2.5) : 48}
            meaningFontSize={active?.sizeOfMeaning ? Math.floor(active.sizeOfMeaning / 2.5) : 24}
          />
        )}
      </View>

      {/* Difficulty badge */}
      {currentWord && (
        <Text style={[styles.diffBadge, { color: colors.textMuted, fontFamily: 'Inter' }]}>
          Ch. {currentWord.dbChapter} · Diff {currentWord.dbDifficulty} · Freq {currentWord.dbFrequency}
        </Text>
      )}

      {/* Controls */}
      <StudyControls
        cardFace={state.cardFace}
        onReveal={reveal}
        onRight={answerRight}
        onWrong={answerWrong}
      />
    </SafeAreaView>
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  diffBadge: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: spacing.sm,
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
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
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
