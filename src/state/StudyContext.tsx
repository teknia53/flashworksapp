import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import type { FlashWord } from '../db/types';
import { adjustDifficulty } from '../hooks/useDifficultyAdjust';
import { shuffle } from '../utils/shuffle';
import { useDatabase } from './DatabaseContext';
import { usePreferences } from './PreferencesContext';

// ─── Types ──────────────────────────────────────────────────────────

export type StudyMode = 'idle' | 'manual' | 'auto';
export type CardFace = 'word' | 'meaning';

interface ErrorEntry {
  dbSequence: number;
  word: string;
  meaning: string;
}

interface StudyState {
  mode: StudyMode;
  deck: FlashWord[];
  currentIndex: number;
  cardFace: CardFace;
  sessionTotal: number;
  sessionErrors: number;
  errors: ErrorEntry[];
  elapsedMs: number;
  isComplete: boolean;
}

type StudyAction =
  | { type: 'LOAD_DECK'; deck: FlashWord[] }
  | { type: 'START'; mode: 'manual' | 'auto' }
  | { type: 'REVEAL' }
  | { type: 'ANSWER'; answer: 'right' | 'wrong'; updatedWord: FlashWord }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'SHUFFLE' }
  | { type: 'TICK'; ms: number }
  | { type: 'RESET' }
  | { type: 'DRILL_ERRORS'; deck: FlashWord[] };

const initialState: StudyState = {
  mode: 'idle',
  deck: [],
  currentIndex: 0,
  cardFace: 'word',
  sessionTotal: 0,
  sessionErrors: 0,
  errors: [],
  elapsedMs: 0,
  isComplete: false,
};

// ─── Reducer ────────────────────────────────────────────────────────

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'LOAD_DECK':
      return {
        ...initialState,
        deck: action.deck,
      };

    case 'START':
      return {
        ...state,
        mode: action.mode,
        currentIndex: 0,
        cardFace: 'word',
        sessionTotal: 0,
        sessionErrors: 0,
        errors: [],
        elapsedMs: 0,
        isComplete: false,
      };

    case 'REVEAL':
      return {
        ...state,
        cardFace: 'meaning',
        sessionTotal: state.sessionTotal + 1,
      };

    case 'ANSWER': {
      const word = state.deck[state.currentIndex];
      const isWrong = action.answer === 'wrong';
      const newErrors = isWrong
        ? [...state.errors, { dbSequence: word.dbSequence, word: word.dbWord, meaning: word.dbMeaning }]
        : state.errors;

      // Update the word in the deck with new difficulty
      const newDeck = [...state.deck];
      newDeck[state.currentIndex] = action.updatedWord;

      // Advance to next card
      const nextIndex = state.currentIndex + 1;
      const isComplete = nextIndex >= state.deck.length;

      return {
        ...state,
        deck: newDeck,
        errors: newErrors,
        sessionErrors: isWrong ? state.sessionErrors + 1 : state.sessionErrors,
        currentIndex: isComplete ? state.currentIndex : nextIndex,
        cardFace: isComplete ? 'meaning' : 'word',
        isComplete,
      };
    }

    case 'NEXT': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.deck.length) {
        return { ...state, isComplete: true };
      }
      return { ...state, currentIndex: nextIndex, cardFace: 'word' };
    }

    case 'PREVIOUS': {
      const prevIndex = Math.max(0, state.currentIndex - 1);
      return { ...state, currentIndex: prevIndex, cardFace: 'word' };
    }

    case 'SHUFFLE':
      return { ...state, deck: shuffle(state.deck), currentIndex: 0, cardFace: 'word', isComplete: false };

    case 'TICK':
      return { ...state, elapsedMs: state.elapsedMs + action.ms };

    case 'RESET':
      return initialState;

    case 'DRILL_ERRORS':
      return {
        ...initialState,
        deck: action.deck,
        mode: state.mode,
      };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────

interface StudyContextValue {
  state: StudyState;
  currentWord: FlashWord | null;
  loadDeck: () => Promise<void>;
  startManual: () => void;
  startAuto: () => void;
  reveal: () => void;
  answerRight: () => Promise<void>;
  answerWrong: () => Promise<void>;
  next: () => void;
  previous: () => void;
  shuffleDeck: () => void;
  resetSession: () => void;
  drillErrors: () => Promise<void>;
  tick: (ms: number) => void;
  /** Restart from top of current deck */
  restartDeck: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(studyReducer, initialState);
  const { getFilteredWords, saveSingleDifficulty, getFilteredWordCount } = useDatabase();
  const { active, wordFilter } = usePreferences();

  const currentWord = state.deck.length > 0 && state.currentIndex < state.deck.length
    ? state.deck[state.currentIndex]
    : null;

  const loadDeck = useCallback(async () => {
    if (!wordFilter) return;
    const words = await getFilteredWords(wordFilter);
    dispatch({ type: 'LOAD_DECK', deck: shuffle(words) });
  }, [wordFilter, getFilteredWords]);

  const startManual = useCallback(() => dispatch({ type: 'START', mode: 'manual' }), []);
  const startAuto = useCallback(() => dispatch({ type: 'START', mode: 'auto' }), []);

  const reveal = useCallback(() => dispatch({ type: 'REVEAL' }), []);

  const answerRight = useCallback(async () => {
    if (!currentWord || !active) return;
    const update = adjustDifficulty(currentWord, 'right', active.setDiffAuto);
    await saveSingleDifficulty(update);
    const updatedWord: FlashWord = {
      ...currentWord,
      dbDifficulty: update.dbDifficulty,
      dbCounter: update.dbCounter,
    };
    dispatch({ type: 'ANSWER', answer: 'right', updatedWord });
  }, [currentWord, active, saveSingleDifficulty]);

  const answerWrong = useCallback(async () => {
    if (!currentWord || !active) return;
    const update = adjustDifficulty(currentWord, 'wrong', active.setDiffAuto);
    await saveSingleDifficulty(update);
    const updatedWord: FlashWord = {
      ...currentWord,
      dbDifficulty: update.dbDifficulty,
      dbCounter: update.dbCounter,
    };
    dispatch({ type: 'ANSWER', answer: 'wrong', updatedWord });
  }, [currentWord, active, saveSingleDifficulty]);

  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const previous = useCallback(() => dispatch({ type: 'PREVIOUS' }), []);
  const shuffleDeck = useCallback(() => dispatch({ type: 'SHUFFLE' }), []);
  const resetSession = useCallback(() => dispatch({ type: 'RESET' }), []);
  const tick = useCallback((ms: number) => dispatch({ type: 'TICK', ms }), []);

  const restartDeck = useCallback(() => {
    dispatch({ type: 'START', mode: state.mode === 'idle' ? 'manual' : state.mode });
  }, [state.mode]);

  const drillErrors = useCallback(async () => {
    if (state.errors.length === 0) return;
    // Re-fetch the error words from the deck (they have updated difficulty)
    const errorSequences = new Set(state.errors.map((e) => e.dbSequence));
    const errorWords = state.deck.filter((w) => errorSequences.has(w.dbSequence));
    dispatch({ type: 'DRILL_ERRORS', deck: shuffle(errorWords) });
  }, [state.errors, state.deck]);

  return (
    <StudyContext.Provider
      value={{
        state,
        currentWord,
        loadDeck,
        startManual,
        startAuto,
        reveal,
        answerRight,
        answerWrong,
        next,
        previous,
        shuffleDeck,
        resetSession,
        drillErrors,
        tick,
        restartDeck,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
