import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTheme, spacing, borderRadius, fontFamilies } from '@/src/theme';
import { convertGreekTyping } from '@/src/utils/greekInput';
import type { FlashWord, WordType } from '@/src/db/types';
import { WORD_TYPE_LABELS, ALL_WORD_TYPES } from '@/src/db/types';

interface WordFormProps {
  initialWord?: FlashWord;
  onSave: (word: Omit<FlashWord, 'dbSequence'> & { dbSequence?: number }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function WordForm({ initialWord, onSave, onDelete, onCancel }: WordFormProps) {
  const { colors } = useTheme();
  const [word, setWord] = useState(initialWord?.dbWord ?? '');
  const [meaning, setMeaning] = useState(initialWord?.dbMeaning ?? '');
  const [principalParts, setPrincipalParts] = useState(initialWord?.dbPrincipalParts ?? '');
  const [chapter, setChapter] = useState(String(initialWord?.dbChapter ?? 0));
  const [frequency, setFrequency] = useState(String(initialWord?.dbFrequency ?? 0));
  const [type, setType] = useState<WordType>(initialWord?.dbType ?? 'N');
  const [difficulty, setDifficulty] = useState(String(initialWord?.dbDifficulty ?? 3));

  const handleSave = () => {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert('Required', 'Word and meaning are required.');
      return;
    }
    onSave({
      dbSequence: initialWord?.dbSequence,
      dbWord: word.trim(),
      dbMeaning: meaning.trim(),
      dbPrincipalParts: principalParts.trim(),
      dbChapter: parseInt(chapter, 10) || 0,
      dbGK: initialWord?.dbGK ?? 0,
      dbFrequency: parseInt(frequency, 10) || 0,
      dbType: type,
      dbDifficulty: Math.min(5, Math.max(1, parseInt(difficulty, 10) || 3)),
      dbSetDiffWordAuto: initialWord?.dbSetDiffWordAuto ?? 1,
      dbCounter: initialWord?.dbCounter ?? 4,
      dbSayWordFile: initialWord?.dbSayWordFile ?? '',
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Word', 'Are you sure you want to delete this word?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const inputStyle = [styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, fontFamily: 'Inter' as const }];

  return (
    <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
        Greek Word
      </Text>
      <TextInput
        style={[inputStyle, { fontFamily: fontFamilies.greek, fontSize: 22 }]}
        value={word}
        onChangeText={(t) => setWord(convertGreekTyping(t))}
        placeholder="Enter Greek word"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
        Meaning
      </Text>
      <TextInput
        style={inputStyle}
        value={meaning}
        onChangeText={setMeaning}
        placeholder="English meaning"
        placeholderTextColor={colors.textMuted}
        multiline
      />

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
        Principal Parts
      </Text>
      <TextInput
        style={[inputStyle, { fontFamily: fontFamilies.greek }]}
        value={principalParts}
        onChangeText={(t) => setPrincipalParts(convertGreekTyping(t))}
        placeholder="Optional"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>Chapter</Text>
          <TextInput style={inputStyle} value={chapter} onChangeText={setChapter} keyboardType="numeric" />
        </View>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>Frequency</Text>
          <TextInput style={inputStyle} value={frequency} onChangeText={setFrequency} keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>Difficulty (1-5)</Text>
          <TextInput style={inputStyle} value={difficulty} onChangeText={setDifficulty} keyboardType="numeric" />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter-Medium' }]}>
        Word Type
      </Text>
      <View style={styles.typeGrid}>
        {ALL_WORD_TYPES.filter((t) => t !== 'U').map((t) => (
          <Pressable
            key={t}
            style={[
              styles.typeChip,
              {
                backgroundColor: type === t ? colors.primary : colors.background,
                borderColor: type === t ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setType(t)}
          >
            <Text
              style={{
                color: type === t ? colors.primaryText : colors.textSecondary,
                fontFamily: 'Inter-Medium',
                fontSize: 13,
              }}
            >
              {WORD_TYPE_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttons}>
        <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>
            {initialWord ? 'Update' : 'Add Word'}
          </Text>
        </Pressable>
        {initialWord && onDelete && (
          <Pressable style={[styles.btn, { backgroundColor: colors.error }]} onPress={handleDelete}>
            <Text style={[styles.btnText, { fontFamily: 'Inter-Bold' }]}>Delete</Text>
          </Pressable>
        )}
        <Pressable style={[styles.btn, { borderWidth: 1, borderColor: colors.border }]} onPress={onCancel}>
          <Text style={[styles.btnText, { color: colors.text, fontFamily: 'Inter-Medium' }]}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.xs },
  label: { fontSize: 13, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  buttons: { gap: spacing.sm, marginTop: spacing.xl },
  btn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16 },
});
