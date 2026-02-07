import { formatTabDelimited } from '../utils/exportFormatter';
import type { FlashWord } from '../db/types';

describe('formatTabDelimited', () => {
  const sampleWord: FlashWord = {
    dbSequence: 1,
    dbChapter: 4,
    dbGK: 100,
    dbDifficulty: 3,
    dbFrequency: 175,
    dbType: 'N',
    dbSetDiffWordAuto: 1,
    dbCounter: 4,
    dbWord: 'ἄγγελος, -ου, ὁ',
    dbSayWordFile: 'aggelo',
    dbMeaning: 'angel; messenger',
    dbPrincipalParts: '',
  };

  it('formats a single word as tab-delimited', () => {
    const result = formatTabDelimited([sampleWord]);
    expect(result).toBe('ἄγγελος, -ου, ὁ\tangel; messenger\tN\t4\t175\t');
  });

  it('formats multiple words with newlines', () => {
    const word2: FlashWord = { ...sampleWord, dbSequence: 2, dbWord: 'ἀμήν', dbMeaning: 'verily', dbType: 'O', dbChapter: 4, dbFrequency: 128, dbPrincipalParts: '' };
    const result = formatTabDelimited([sampleWord, word2]);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('ἀμήν');
  });

  it('handles empty array', () => {
    expect(formatTabDelimited([])).toBe('');
  });
});
