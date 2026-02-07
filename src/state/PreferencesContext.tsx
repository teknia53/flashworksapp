import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useDatabase } from './DatabaseContext';
import type { CodesConfig, WordFilter, WordType } from '../db/types';
import { ALL_WORD_TYPES } from '../db/types';

/** Preferences that can be overridden per-session */
export interface SessionPrefs {
  lowDiff: number;
  highDiff: number;
  searchChapter: boolean;
  lowChpt: number;
  highChpt: number;
  searchFrequency: boolean;
  lowFreq: number;
  highFreq: number;
  searchType: boolean;
  enabledTypes: WordType[];
  setDiffAuto: boolean;
  seconds: number;
  direction: number;
  sizeOfForeign: number;
  sizeOfMeaning: number;
}

interface PreferencesContextValue {
  /** Saved (DB) preferences */
  saved: SessionPrefs | null;
  /** Current active preferences (session overrides saved) */
  active: SessionPrefs | null;
  /** Whether session overrides are active */
  isSessionActive: boolean;
  /** Apply session overrides (temporary, not saved to DB) */
  setSessionOverride: (overrides: Partial<SessionPrefs>) => void;
  /** Clear session overrides, revert to saved */
  clearSession: () => void;
  /** Save current active prefs to DB */
  saveToDb: () => Promise<void>;
  /** Get a WordFilter from current active prefs */
  wordFilter: WordFilter | null;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function configToPrefs(cfg: CodesConfig): SessionPrefs {
  const types: WordType[] = [];
  if (cfg.dbNoun) types.push('N');
  if (cfg.dbAdj) types.push('A');
  if (cfg.dbVerb) types.push('V');
  if (cfg.dbPrep) types.push('P');
  if (cfg.dbOther) types.push('O');
  if (cfg.dbStem) types.push('S');
  if (cfg.dbGram) types.push('G');
  // U is always included if other types are filtered
  return {
    lowDiff: cfg.dbLowDiff,
    highDiff: cfg.dbHighDiff,
    searchChapter: cfg.dbSearchChapter === 1,
    lowChpt: cfg.dbLowChpt,
    highChpt: cfg.dbHighChpt,
    searchFrequency: cfg.dbSearchFrequency === 1,
    lowFreq: cfg.dbLowFreq,
    highFreq: cfg.dbHighFreq,
    searchType: cfg.dbSearchType === 1,
    enabledTypes: types.length > 0 ? types : ALL_WORD_TYPES,
    setDiffAuto: cfg.dbSetDiffAuto === 1,
    seconds: cfg.dbSeconds,
    direction: cfg.dbDirection,
    sizeOfForeign: cfg.dbSizeOfForeign,
    sizeOfMeaning: cfg.dbSizeOfMeaning,
  };
}

function prefsToConfigUpdates(prefs: SessionPrefs): Partial<CodesConfig> {
  return {
    dbLowDiff: prefs.lowDiff,
    dbHighDiff: prefs.highDiff,
    dbSearchChapter: prefs.searchChapter ? 1 : 0,
    dbLowChpt: prefs.lowChpt,
    dbHighChpt: prefs.highChpt,
    dbSearchFrequency: prefs.searchFrequency ? 1 : 0,
    dbLowFreq: prefs.lowFreq,
    dbHighFreq: prefs.highFreq,
    dbSearchType: prefs.searchType ? 1 : 0,
    dbNoun: prefs.enabledTypes.includes('N') ? 1 : 0,
    dbAdj: prefs.enabledTypes.includes('A') ? 1 : 0,
    dbVerb: prefs.enabledTypes.includes('V') ? 1 : 0,
    dbPrep: prefs.enabledTypes.includes('P') ? 1 : 0,
    dbOther: prefs.enabledTypes.includes('O') ? 1 : 0,
    dbStem: prefs.enabledTypes.includes('S') ? 1 : 0,
    dbGram: prefs.enabledTypes.includes('G') ? 1 : 0,
    dbSetDiffAuto: prefs.setDiffAuto ? 1 : 0,
    dbSeconds: prefs.seconds,
    dbDirection: prefs.direction,
    dbSizeOfForeign: prefs.sizeOfForeign,
    dbSizeOfMeaning: prefs.sizeOfMeaning,
  };
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { config, saveConfig, isReady } = useDatabase();
  const [saved, setSaved] = useState<SessionPrefs | null>(null);
  const [sessionOverrides, setSessionOverrides] = useState<Partial<SessionPrefs>>({});

  useEffect(() => {
    if (config) {
      setSaved(configToPrefs(config));
    }
  }, [config]);

  const isSessionActive = Object.keys(sessionOverrides).length > 0;

  const active = useMemo(() => {
    if (!saved) return null;
    if (!isSessionActive) return saved;
    return { ...saved, ...sessionOverrides };
  }, [saved, sessionOverrides, isSessionActive]);

  const wordFilter = useMemo<WordFilter | null>(() => {
    if (!active) return null;
    return {
      lowDiff: active.lowDiff,
      highDiff: active.highDiff,
      searchChapter: active.searchChapter,
      lowChpt: active.lowChpt,
      highChpt: active.highChpt,
      searchFrequency: active.searchFrequency,
      lowFreq: active.lowFreq,
      highFreq: active.highFreq,
      searchType: active.searchType,
      enabledTypes: active.enabledTypes,
    };
  }, [active]);

  const setSessionOverride = useCallback((overrides: Partial<SessionPrefs>) => {
    setSessionOverrides((prev) => ({ ...prev, ...overrides }));
  }, []);

  const clearSession = useCallback(() => {
    setSessionOverrides({});
  }, []);

  const saveToDb = useCallback(async () => {
    if (!active) return;
    await saveConfig(prefsToConfigUpdates(active));
    setSaved(active);
    setSessionOverrides({});
  }, [active, saveConfig]);

  return (
    <PreferencesContext.Provider
      value={{
        saved,
        active,
        isSessionActive,
        setSessionOverride,
        clearSession,
        saveToDb,
        wordFilter,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
