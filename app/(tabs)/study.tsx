import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/theme';
import { useDatabase } from '@/src/state/DatabaseContext';
import type { FlashWord } from '@/src/db/types';

export default function StudyScreen() {
  const { colors } = useTheme();
  const { isReady, config, getTotalWordCount, getAllWords } = useDatabase();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [sampleWord, setSampleWord] = useState<FlashWord | null>(null);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      const count = await getTotalWordCount();
      setTotalCount(count);
      const words = await getAllWords();
      if (words.length > 0) setSampleWord(words[0]);
    })();
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loading, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
          Loading database...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
        Study
      </Text>
      <Text style={[styles.count, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
        {totalCount !== null ? `${totalCount} words loaded` : 'Loading...'}
      </Text>
      {config && (
        <Text style={[styles.detail, { color: colors.textMuted, fontFamily: 'Inter' }]}>
          Language: {config.dbLanguageName}
        </Text>
      )}
      {sampleWord && (
        <View style={[styles.sampleCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.greek, { color: colors.greekText, fontFamily: 'GentiumPlus' }]}>
            {sampleWord.dbWord}
          </Text>
          <Text style={[styles.meaning, { color: colors.meaningText, fontFamily: 'Inter' }]}>
            {sampleWord.dbMeaning}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 8 },
  count: { fontSize: 16, marginBottom: 4 },
  detail: { fontSize: 14, marginBottom: 20 },
  loading: { marginTop: 12, fontSize: 16 },
  sampleCard: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  greek: { fontSize: 36, marginBottom: 12 },
  meaning: { fontSize: 18 },
});
