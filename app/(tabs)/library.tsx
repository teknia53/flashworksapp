import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, Modal,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system/next';
import { useTheme, spacing, borderRadius } from '@/src/theme';
import { useDatabase } from '@/src/state/DatabaseContext';
import { WordRow } from '@/src/components/library/WordRow';
import { WordForm } from '@/src/components/library/WordForm';
import type { FlashWord } from '@/src/db/types';
import { parseTabDelimited } from '@/src/utils/importParser';
import { formatTabDelimited } from '@/src/utils/exportFormatter';
import { convertGreekTyping, normalizeGreek } from '@/src/utils/greekInput';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { isReady, getAllWords, addWord, updateWord, deleteWord } = useDatabase();
  const [words, setWords] = useState<FlashWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<FlashWord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const loadWords = useCallback(async () => {
    if (!isReady) return;
    const all = await getAllWords();
    const query = searchQuery.trim();
    if (!query) {
      setWords(all);
      return;
    }
    // Match typed text against English meanings, and its Greek conversion
    // (legacy font keystrokes like "lovgoV") against Greek words, ignoring accents.
    const qLower = query.toLowerCase();
    const qGreek = normalizeGreek(convertGreekTyping(query));
    setWords(
      all.filter(
        (w) =>
          w.dbMeaning.toLowerCase().includes(qLower) ||
          normalizeGreek(w.dbWord).includes(qGreek)
      )
    );
  }, [isReady, searchQuery, getAllWords]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleWordPress = (word: FlashWord) => {
    setSelectedWord(word);
    setIsAdding(false);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedWord(null);
    setIsAdding(true);
    setShowForm(true);
  };

  const handleSave = async (data: Omit<FlashWord, 'dbSequence'> & { dbSequence?: number }) => {
    if (data.dbSequence) {
      await updateWord(data as FlashWord);
    } else {
      await addWord(data);
    }
    setShowForm(false);
    loadWords();
  };

  const handleDelete = async () => {
    if (selectedWord) {
      await deleteWord(selectedWord.dbSequence);
      setShowForm(false);
      loadWords();
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = new File(result.assets[0].uri);
      const text = await file.text();
      const parsed = parseTabDelimited(text);
      if (parsed.length === 0) {
        Alert.alert('Import Error', 'No valid words found in file.');
        return;
      }
      Alert.alert(
        'Import Words',
        `Found ${parsed.length} words. Import them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              for (const w of parsed) {
                await addWord(w);
              }
              loadWords();
              Alert.alert('Done', `Imported ${parsed.length} words.`);
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Import Error', 'Failed to read file.');
    }
  };

  const handleExport = async () => {
    try {
      const allWords = await getAllWords();
      const text = formatTabDelimited(allWords);
      const exportFile = new File(Paths.cache, 'flashworks-export.txt');
      exportFile.write(text);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(exportFile.uri, {
          mimeType: 'text/plain',
          dialogTitle: 'Export FlashWorks Words',
        });
      } else {
        Alert.alert('Export', 'Sharing is not available on this device.');
      }
    } catch (e) {
      Alert.alert('Export Error', 'Failed to export words.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: 'Inter' }]}
            placeholder="Search words or meanings..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
      </View>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <Text style={[styles.count, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
          {words.length} words
        </Text>
        <View style={styles.infoActions}>
          <Pressable style={styles.iconBtn} onPress={handleImport}>
            <Ionicons name="download" size={22} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={handleExport}>
            <Ionicons name="share" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Word list */}
      <FlatList
        data={words}
        keyExtractor={(item) => String(item.dbSequence)}
        renderItem={({ item }) => (
          <WordRow word={item} onPress={() => handleWordPress(item)} />
        )}
        contentContainerStyle={words.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: 'Inter' }]}>
              {searchQuery ? 'No words match your search' : 'No words in database'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Word editor modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <WordForm
            initialWord={isAdding ? undefined : selectedWord ?? undefined}
            onSave={handleSave}
            onDelete={selectedWord ? handleDelete : undefined}
            onCancel={() => setShowForm(false)}
          />
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  count: { fontSize: 14 },
  infoActions: { flexDirection: 'row', gap: spacing.md },
  iconBtn: { padding: spacing.xs },
  emptyList: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['6xl'],
    gap: spacing.md,
  },
  emptyText: { fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
