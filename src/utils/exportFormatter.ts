import type { FlashWord } from '../db/types';

/**
 * Format words as tab-delimited text for export.
 * Format: word\tmeaning\ttype\tchapter\tfrequency\tprincipalParts
 */
export function formatTabDelimited(words: FlashWord[]): string {
  return words
    .map(
      (w) =>
        `${w.dbWord}\t${w.dbMeaning}\t${w.dbType}\t${w.dbChapter}\t${w.dbFrequency}\t${w.dbPrincipalParts}`
    )
    .join('\n');
}
