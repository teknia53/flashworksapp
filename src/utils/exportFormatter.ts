import type { FlashWord } from '../db/types';

/**
 * Re-encode real newlines as the desktop app's `<br />` marker. Records here are
 * separated by real newlines, so a newline left inside a field would split one
 * word across two unparseable rows. importParser decodes these back.
 */
export function encodeLineBreaks(field: string): string {
  return field.replace(/\r?\n/g, '<br />');
}

/**
 * Format words as tab-delimited text for export.
 * Format: word\tmeaning\ttype\tchapter\tfrequency\tprincipalParts
 */
export function formatTabDelimited(words: FlashWord[]): string {
  return words
    .map((w) =>
      [
        w.dbWord,
        encodeLineBreaks(w.dbMeaning),
        w.dbType,
        w.dbChapter,
        w.dbFrequency,
        encodeLineBreaks(w.dbPrincipalParts ?? ''),
      ].join('\t')
    )
    .join('\n');
}
