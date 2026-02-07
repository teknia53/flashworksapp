import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { usePreferences } from '@/src/state/PreferencesContext';
import { useDatabase } from '@/src/state/DatabaseContext';
import { Section } from '@/src/components/ui/Section';
import { SettingRow } from '@/src/components/ui/SettingRow';
import { RangeDisplay } from '@/src/components/ui/RangeDisplay';
import { TypeToggle } from '@/src/components/ui/TypeToggle';
import type { WordType } from '@/src/db/types';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { active, isSessionActive, setSessionOverride, clearSession, saveToDb, wordFilter } =
    usePreferences();
  const { getFilteredWordCount } = useDatabase();
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // Update match count whenever filter changes
  useEffect(() => {
    if (!wordFilter) return;
    getFilteredWordCount(wordFilter).then(setMatchCount);
  }, [wordFilter, getFilteredWordCount]);

  const handleTypeToggle = useCallback(
    (type: WordType) => {
      if (!active) return;
      const current = active.enabledTypes;
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      if (next.length === 0) return; // Must have at least one type
      setSessionOverride({ enabledTypes: next });
    },
    [active, setSessionOverride]
  );

  const handleSave = useCallback(async () => {
    await saveToDb();
    Alert.alert('Saved', 'Preferences saved to database.');
  }, [saveToDb]);

  if (!active) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, fontFamily: 'Inter' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {/* Match count banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={[styles.bannerText, { fontFamily: 'Inter-Bold' }]}>
          {matchCount !== null ? `${matchCount} words match` : 'Counting...'}
        </Text>
      </View>

      {/* Session indicator */}
      {isSessionActive && (
        <View style={[styles.sessionBar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.sessionText, { color: colors.primaryText, fontFamily: 'Inter-Medium' }]}>
            Session overrides active
          </Text>
          <Pressable onPress={clearSession}>
            <Text style={[styles.sessionReset, { color: colors.primaryText, fontFamily: 'Inter-Bold' }]}>
              Reset
            </Text>
          </Pressable>
        </View>
      )}

      {/* Difficulty Filter */}
      <Section title="Difficulty">
        <RangeDisplay
          label="Difficulty Range"
          low={active.lowDiff}
          high={active.highDiff}
          min={1}
          max={5}
          onLowChange={(val) => setSessionOverride({ lowDiff: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ highDiff: Math.round(val) })}
        />
        <SettingRow
          label="Auto-adjust difficulty"
          toggle={active.setDiffAuto}
          onToggle={(val) => setSessionOverride({ setDiffAuto: val })}
          last
        />
      </Section>

      {/* Chapter Filter */}
      <Section title="Chapter">
        <SettingRow
          label="Filter by chapter"
          toggle={active.searchChapter}
          onToggle={(val) => setSessionOverride({ searchChapter: val })}
        />
        <RangeDisplay
          label="Chapter Range"
          low={active.lowChpt}
          high={active.highChpt}
          min={1}
          max={99}
          onLowChange={(val) => setSessionOverride({ lowChpt: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ highChpt: Math.round(val) })}
          enabled={active.searchChapter}
        />
      </Section>

      {/* Frequency Filter */}
      <Section title="Frequency">
        <SettingRow
          label="Filter by frequency"
          toggle={active.searchFrequency}
          onToggle={(val) => setSessionOverride({ searchFrequency: val })}
        />
        <RangeDisplay
          label="NT Frequency Range"
          low={active.lowFreq}
          high={active.highFreq}
          min={1}
          max={99999}
          step={10}
          onLowChange={(val) => setSessionOverride({ lowFreq: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ highFreq: Math.round(val) })}
          enabled={active.searchFrequency}
        />
      </Section>

      {/* Word Type Filter */}
      <Section title="Word Types">
        <SettingRow
          label="Filter by type"
          toggle={active.searchType}
          onToggle={(val) => setSessionOverride({ searchType: val })}
        />
        <TypeToggle
          enabledTypes={active.enabledTypes}
          onToggle={handleTypeToggle}
          enabled={active.searchType}
        />
      </Section>

      {/* Display */}
      <Section title="Display">
        <RangeDisplay
          label="Greek Font Size"
          low={active.sizeOfForeign}
          high={active.sizeOfForeign}
          min={24}
          max={200}
          step={4}
          onLowChange={(val) => setSessionOverride({ sizeOfForeign: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ sizeOfForeign: Math.round(val) })}
        />
        <RangeDisplay
          label="Meaning Font Size"
          low={active.sizeOfMeaning}
          high={active.sizeOfMeaning}
          min={16}
          max={120}
          step={2}
          onLowChange={(val) => setSessionOverride({ sizeOfMeaning: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ sizeOfMeaning: Math.round(val) })}
        />
      </Section>

      {/* Auto Mode */}
      <Section title="Auto Mode">
        <RangeDisplay
          label="Seconds per card"
          low={active.seconds}
          high={active.seconds}
          min={1}
          max={30}
          onLowChange={(val) => setSessionOverride({ seconds: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ seconds: Math.round(val) })}
        />
      </Section>

      {/* Save Button */}
      <Pressable
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveBtnText, { fontFamily: 'Inter-Bold' }]}>
          Save Preferences
        </Text>
      </Pressable>

      <View style={{ height: spacing['5xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg },
  banner: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bannerText: { color: '#fff', fontSize: 16 },
  sessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  sessionText: { fontSize: 14 },
  sessionReset: { fontSize: 14 },
  saveBtn: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveBtnText: { color: '#fff', fontSize: 16 },
});
