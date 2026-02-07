import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, closeDatabase } from '../db/database';
import * as queries from '../db/queries';
import type { FlashWord, CodesConfig, WordFilter } from '../db/types';

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  isReady: boolean;
  config: CodesConfig | null;
  /** Reload config from DB */
  refreshConfig: () => Promise<void>;
  /** Save partial config updates */
  saveConfig: (updates: Partial<CodesConfig>) => Promise<void>;
  /** Get filtered words based on current filter */
  getFilteredWords: (filter: WordFilter) => Promise<FlashWord[]>;
  /** Get all words unfiltered */
  getAllWords: () => Promise<FlashWord[]>;
  /** Search words */
  searchWords: (query: string) => Promise<FlashWord[]>;
  /** Get count matching filter */
  getFilteredWordCount: (filter: WordFilter) => Promise<number>;
  /** Total word count */
  getTotalWordCount: () => Promise<number>;
  /** Chapter range */
  getChapterRange: () => Promise<{ min: number; max: number }>;
  /** Frequency range */
  getFrequencyRange: () => Promise<{ min: number; max: number }>;
  /** CRUD */
  addWord: (word: Omit<FlashWord, 'dbSequence'>) => Promise<number>;
  updateWord: (word: FlashWord) => Promise<void>;
  deleteWord: (dbSequence: number) => Promise<void>;
  /** Difficulty */
  saveSingleDifficulty: (update: {
    dbSequence: number;
    dbDifficulty: number;
    dbCounter: number;
    dbSetDiffWordAuto: number;
  }) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState<CodesConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const database = await getDatabase();
      if (!mounted) return;
      setDb(database);
      const cfg = await queries.getConfig(database);
      if (!mounted) return;
      setConfig(cfg);
      setIsReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshConfig = useCallback(async () => {
    if (!db) return;
    const cfg = await queries.getConfig(db);
    setConfig(cfg);
  }, [db]);

  const saveConfig = useCallback(
    async (updates: Partial<CodesConfig>) => {
      if (!db) return;
      await queries.updateConfig(db, updates);
      await refreshConfig();
    },
    [db, refreshConfig]
  );

  const value: DatabaseContextValue = {
    db,
    isReady,
    config,
    refreshConfig,
    saveConfig,
    getFilteredWords: useCallback(
      (filter: WordFilter) => {
        if (!db) return Promise.resolve([]);
        return queries.getFilteredWords(db, filter);
      },
      [db]
    ),
    getAllWords: useCallback(() => {
      if (!db) return Promise.resolve([]);
      return queries.getAllWords(db);
    }, [db]),
    searchWords: useCallback(
      (query: string) => {
        if (!db) return Promise.resolve([]);
        return queries.searchWords(db, query);
      },
      [db]
    ),
    getFilteredWordCount: useCallback(
      (filter: WordFilter) => {
        if (!db) return Promise.resolve(0);
        return queries.getFilteredWordCount(db, filter);
      },
      [db]
    ),
    getTotalWordCount: useCallback(() => {
      if (!db) return Promise.resolve(0);
      return queries.getTotalWordCount(db);
    }, [db]),
    getChapterRange: useCallback(() => {
      if (!db) return Promise.resolve({ min: 1, max: 99 });
      return queries.getChapterRange(db);
    }, [db]),
    getFrequencyRange: useCallback(() => {
      if (!db) return Promise.resolve({ min: 1, max: 99999 });
      return queries.getFrequencyRange(db);
    }, [db]),
    addWord: useCallback(
      (word: Omit<FlashWord, 'dbSequence'>) => {
        if (!db) return Promise.resolve(0);
        return queries.addWord(db, word);
      },
      [db]
    ),
    updateWord: useCallback(
      (word: FlashWord) => {
        if (!db) return Promise.resolve();
        return queries.updateWord(db, word);
      },
      [db]
    ),
    deleteWord: useCallback(
      (dbSequence: number) => {
        if (!db) return Promise.resolve();
        return queries.deleteWord(db, dbSequence);
      },
      [db]
    ),
    saveSingleDifficulty: useCallback(
      (update: {
        dbSequence: number;
        dbDifficulty: number;
        dbCounter: number;
        dbSetDiffWordAuto: number;
      }) => {
        if (!db) return Promise.resolve();
        return queries.saveSingleDifficulty(db, update);
      },
      [db]
    ),
  };

  return (
    <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
