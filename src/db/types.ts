/** Word type codes from the Xojo source */
export type WordType = 'N' | 'V' | 'A' | 'P' | 'O' | 'S' | 'G' | 'U';

export const WORD_TYPE_LABELS: Record<WordType, string> = {
  N: 'Noun',
  V: 'Verb',
  A: 'Adjective',
  P: 'Preposition',
  O: 'Other',
  S: 'Stem',
  G: 'Grammar',
  U: 'Unknown',
};

export const ALL_WORD_TYPES: WordType[] = ['N', 'V', 'A', 'P', 'O', 'S', 'G', 'U'];

/** Row from the FLASH table */
export interface FlashWord {
  dbSequence: number;
  dbChapter: number;
  dbGK: number;
  dbDifficulty: number;
  dbFrequency: number;
  dbType: WordType;
  dbSetDiffWordAuto: number; // 0 or 1
  dbCounter: number; // 1-7
  dbWord: string;
  dbSayWordFile: string;
  dbMeaning: string;
  dbPrincipalParts: string;
}

/** Single row from the CODES config table */
export interface CodesConfig {
  dbSequenceCode: number;
  dbVersion: number;
  dbLanguageName: string;
  dbSayWord: number;
  dbSayMeaning: number;
  dbSayWordFrequency: number;
  dbSayIgnore: number;
  dbHighDiff: number;
  dbLowDiff: number;
  dbSearchChapter: number;
  dbHighChpt: number;
  dbLowChpt: number;
  dbSearchFrequency: number;
  dbHighFreq: number;
  dbLowFreq: number;
  dbAcceptableTypes: string;
  dbSearchType: number;
  dbNoun: number;
  dbAdj: number;
  dbVerb: number;
  dbPrep: number;
  dbOther: number;
  dbGram: number;
  dbStem: number;
  dbSetDiffAuto: number;
  dbSeconds: number;
  dbDirection: number;
  dbFontOfForeign: string;
  dbSizeOfForeign: number;
  dbColorOfForeign: string;
  dbFontOfMeaning: string;
  dbSizeOfMeaning: number;
  dbSizeOfParts: number;
}

/** Filter parameters for querying words */
export interface WordFilter {
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
}

/** Difficulty update to batch-write back to DB */
export interface DifficultyUpdate {
  dbSequence: number;
  dbDifficulty: number;
  dbCounter: number;
  dbSetDiffWordAuto: number;
}
