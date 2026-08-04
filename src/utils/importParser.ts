import type { FlashWord, WordType } from '../db/types';

/**
 * The desktop app marks a line break inside a field with a literal `<br />`,
 * because this format already uses real newlines to separate records. Decode
 * those to real newlines on the way in; exportFormatter re-encodes them.
 */
export function decodeLineBreaks(field: string): string {
  return field.replace(/\s*<\s*br\s*\/?\s*>\s*/gi, '\n');
}

/**
 * Parse tab-delimited text into FlashWord objects.
 * Expected format per line: word\tmeaning\ttype\tchapter\tfrequency\tprincipalParts
 * Minimum required: word and meaning (first two fields)
 */
export function parseTabDelimited(text: string): Omit<FlashWord, 'dbSequence'>[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const parts = line.split('\t');
    const word = parts[0]?.trim() ?? '';
    const meaning = decodeLineBreaks(parts[1]?.trim() ?? '');
    const type = (parts[2]?.trim() ?? 'O') as WordType;
    const chapter = parseInt(parts[3]?.trim() ?? '0', 10) || 0;
    const frequency = parseInt(parts[4]?.trim() ?? '0', 10) || 0;
    const principalParts = decodeLineBreaks(parts[5]?.trim() ?? '');

    return {
      dbChapter: chapter,
      dbGK: 0,
      dbDifficulty: 3,
      dbFrequency: frequency,
      dbType: type,
      dbSetDiffWordAuto: 1,
      dbCounter: 4,
      dbWord: word,
      dbSayWordFile: '',
      dbMeaning: meaning,
      dbPrincipalParts: principalParts,
    };
  });
}
