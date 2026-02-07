import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { useStudy } from '@/src/state/StudyContext';
import { StatCard } from '@/src/components/stats/StatCard';
import { ErrorListItem } from '@/src/components/stats/ErrorListItem';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const { state, drillErrors, resetSession } = useStudy();

  const accuracy = state.sessionTotal > 0
    ? Math.round(((state.sessionTotal - state.sessionErrors) / state.sessionTotal) * 100)
    : 0;

  const handleReset = () => {
    Alert.alert(
      'Reset Session',
      'This will clear all session stats and errors. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSession },
      ]
    );
  };

  const handleDrillErrors = () => {
    if (state.errors.length === 0) {
      Alert.alert('No Errors', 'No missed words to drill.');
      return;
    }
    drillErrors();
    Alert.alert('Drilling Errors', `Loaded ${state.errors.length} missed words into the study deck. Switch to the Study tab to begin.`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Stat cards */}
            <View style={styles.statsGrid}>
              <StatCard icon="flash" label="Words" value={state.sessionTotal} />
              <StatCard icon="close-circle" label="Errors" value={state.sessionErrors} color={colors.error} />
            </View>
            <View style={styles.statsGrid}>
              <StatCard icon="checkmark-circle" label="Accuracy" value={`${accuracy}%`} color={colors.success} />
              <StatCard icon="time" label="Time" value={formatTime(state.elapsedMs)} />
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              {state.errors.length > 0 && (
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.error }]}
                  onPress={handleDrillErrors}
                >
                  <Ionicons name="repeat" size={20} color="#fff" />
                  <Text style={[styles.actionBtnText, { fontFamily: 'Inter-Bold' }]}>
                    Drill Missed Words ({state.errors.length})
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={[styles.actionBtnText, { fontFamily: 'Inter-Bold' }]}>
                  Reset Session
                </Text>
              </Pressable>
            </View>

            {/* Error list header */}
            {state.errors.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
                Missed Words
              </Text>
            )}
          </>
        }
        data={state.errors}
        keyExtractor={(item) => `${item.dbSequence}`}
        renderItem={({ item, index }) => (
          <ErrorListItem word={item.word} meaning={item.meaning} index={index} />
        )}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          state.sessionTotal === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="stats-chart" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'Inter' }]}>
                Start a study session to see stats
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  actionBtnText: { color: '#fff', fontSize: 15 },
  sectionTitle: {
    fontSize: 18,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyText: { fontSize: 16 },
});
