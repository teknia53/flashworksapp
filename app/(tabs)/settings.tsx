import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { usePreferences } from '@/src/state/PreferencesContext';
import { useDatabase } from '@/src/state/DatabaseContext';
import { SettingRow } from '@/src/components/ui/SettingRow';
import { RangeDisplay } from '@/src/components/ui/RangeDisplay';
import { TypeToggle } from '@/src/components/ui/TypeToggle';
import type { WordType } from '@/src/db/types';

function Accordion({
  title,
  expanded,
  onToggle,
  children,
  colors,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.accordion, { backgroundColor: colors.surface }]}>
      <Pressable onPress={onToggle} style={styles.accordionHeader}>
        <Text style={[styles.accordionTitle, { color: colors.text, fontFamily: 'Inter-Medium' }]}>
          {title}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { active, isSessionActive, setSessionOverride, clearSession, saveToDb, wordFilter } =
    usePreferences();
  const { getFilteredWordCount } = useDatabase();
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

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
      if (next.length === 0) return;
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      {/* Accordions */}
      <Accordion title="Difficulty" expanded={expanded === 'diff'} onToggle={() => toggle('diff')} colors={colors}>
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
      </Accordion>

      <Accordion title="Chapter" expanded={expanded === 'chpt'} onToggle={() => toggle('chpt')} colors={colors}>
        <SettingRow
          label="Filter by chapter"
          toggle={active.searchChapter}
          onToggle={(val) => setSessionOverride({ searchChapter: val })}
        />
        <RangeDisplay
          label="Chapter Range"
          low={active.lowChpt}
          high={active.highChpt}
          min={4}
          max={36}
          onLowChange={(val) => setSessionOverride({ lowChpt: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ highChpt: Math.round(val) })}
          enabled={active.searchChapter}
        />
      </Accordion>

      <Accordion title="Frequency" expanded={expanded === 'freq'} onToggle={() => toggle('freq')} colors={colors}>
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
          max={20000}
          step={10}
          onLowChange={(val) => setSessionOverride({ lowFreq: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ highFreq: Math.round(val) })}
          enabled={active.searchFrequency}
        />
      </Accordion>

      <Accordion title="Word Types" expanded={expanded === 'types'} onToggle={() => toggle('types')} colors={colors}>
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
      </Accordion>

      <Accordion title="Display" expanded={expanded === 'display'} onToggle={() => toggle('display')} colors={colors}>
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
      </Accordion>

      <Accordion title="Auto Mode" expanded={expanded === 'auto'} onToggle={() => toggle('auto')} colors={colors}>
        <RangeDisplay
          label="Seconds per card"
          low={active.seconds}
          high={active.seconds}
          min={1}
          max={30}
          onLowChange={(val) => setSessionOverride({ seconds: Math.round(val) })}
          onHighChange={(val) => setSessionOverride({ seconds: Math.round(val) })}
        />
      </Accordion>

      {/* Save Button */}
      <Pressable
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={[styles.saveBtnText, { fontFamily: 'Inter-Bold' }]}>
          Save Preferences
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: spacing.md },
  banner: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bannerText: { color: '#fff', fontSize: 15 },
  sessionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  sessionText: { fontSize: 13 },
  sessionReset: { fontSize: 13 },
  accordion: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accordionTitle: { fontSize: 15 },
  accordionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  saveBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  saveBtnText: { color: '#fff', fontSize: 15 },
});
