import { parseTabDelimited, decodeLineBreaks } from '../utils/importParser';
import { formatTabDelimited, encodeLineBreaks } from '../utils/exportFormatter';
import type { FlashWord } from '../db/types';

/**
 * The desktop app writes a line break inside a field as a literal `<br />`,
 * because this tab-delimited format separates records with real newlines.
 * Import decodes, export re-encodes. If those two ever disagree, an export
 * followed by an import silently corrupts the word list, so the round trip is
 * covered here rather than each direction in isolation.
 */
describe('line-break encoding between the app and the desktop format', () => {
  describe('decodeLineBreaks', () => {
    it('converts <br /> to a real newline', () => {
      expect(decodeLineBreaks('gen: through <br />acc: on account of')).toBe(
        'gen: through\nacc: on account of'
      );
    });

    it('handles the tag variants the desktop app might emit', () => {
      expect(decodeLineBreaks('a<br>b')).toBe('a\nb');
      expect(decodeLineBreaks('a<br/>b')).toBe('a\nb');
      expect(decodeLineBreaks('a<BR />b')).toBe('a\nb');
      expect(decodeLineBreaks('a< br / >b')).toBe('a\nb');
    });

    it('absorbs the whitespace around the tag rather than doubling it', () => {
      expect(decodeLineBreaks('a  <br />  b')).toBe('a\nb');
    });

    it('leaves text without tags untouched', () => {
      expect(decodeLineBreaks('synagogue; meeting')).toBe('synagogue; meeting');
    });
  });

  describe('encodeLineBreaks', () => {
    it('converts a newline back to <br />', () => {
      expect(encodeLineBreaks('gen: through\nacc: on account of')).toBe(
        'gen: through<br />acc: on account of'
      );
    });

    it('also handles CRLF', () => {
      expect(encodeLineBreaks('a\r\nb')).toBe('a<br />b');
    });
  });

  it('survives an export/import round trip with multi-line meanings', () => {
    const word: FlashWord = {
      dbSequence: 1,
      dbChapter: 8,
      dbGK: 100,
      dbDifficulty: 3,
      dbFrequency: 194,
      dbType: 'P',
      dbSetDiffWordAuto: 1,
      dbCounter: 4,
      dbWord: 'παρά',
      dbSayWordFile: '',
      dbMeaning: 'gen: from;\ndat: beside, in the presence of;\nacc: alongside of',
      dbPrincipalParts: '',
    };

    const exported = formatTabDelimited([word]);
    // The critical property: one word must still occupy exactly one line.
    expect(exported.split('\n')).toHaveLength(1);
    expect(exported).toContain('<br />');

    const [reimported] = parseTabDelimited(exported);
    expect(reimported.dbMeaning).toBe(word.dbMeaning);
    expect(reimported.dbWord).toBe('παρά');
  });

  it('keeps multi-line words separable when several are exported together', () => {
    const make = (w: string, m: string): FlashWord => ({
      dbSequence: 1,
      dbChapter: 4,
      dbGK: 0,
      dbDifficulty: 3,
      dbFrequency: 0,
      dbType: 'N',
      dbSetDiffWordAuto: 1,
      dbCounter: 4,
      dbWord: w,
      dbSayWordFile: '',
      dbMeaning: m,
      dbPrincipalParts: '',
    });

    const words = [make('διά', 'gen: through\nacc: on account of'), make('θεός', 'God, god')];
    const exported = formatTabDelimited(words);
    expect(exported.split('\n')).toHaveLength(2);

    const back = parseTabDelimited(exported);
    expect(back).toHaveLength(2);
    expect(back[0].dbMeaning).toBe('gen: through\nacc: on account of');
    expect(back[1].dbMeaning).toBe('God, god');
  });
});
