import { convertGreekTyping, normalizeGreek } from '../utils/greekInput';

describe('convertGreekTyping', () => {
  it('converts plain letters', () => {
    expect(convertGreekTyping('logos')).toBe('λογος');
    expect(convertGreekTyping('anqrwpos')).toBe('ανθρωπος');
  });

  it('converts V to final sigma', () => {
    expect(convertGreekTyping('logoV')).toBe('λογος');
  });

  it('converts a trailing s to final sigma automatically', () => {
    expect(convertGreekTyping('logos kai logos')).toBe('λογος και λογος');
  });

  it('keeps a non-final sigma medial', () => {
    expect(convertGreekTyping('apostolos')).toBe('αποστολος');
  });

  it('applies acute accent typed after the vowel', () => {
    expect(convertGreekTyping('lovgoV')).toBe('λόγος');
    expect(convertGreekTyping('kaiv')).toBe('καί');
  });

  it('applies breathings', () => {
    expect(convertGreekTyping('ejn')).toBe('ἐν');
    expect(convertGreekTyping('oJ')).toBe('ὁ');
    expect(convertGreekTyping('aujtovV')).toBe('αὐτός');
  });

  it('applies circumflex and iota subscript', () => {
    expect(convertGreekTyping("tou'")).toBe('τοῦ');
    expect(convertGreekTyping("th'|")).toBe('τῇ');
  });

  it('accepts beta-code accent symbols', () => {
    expect(convertGreekTyping('lo/goV')).toBe('λόγος');
    expect(convertGreekTyping('e)n')).toBe('ἐν');
  });

  it('converts capitals', () => {
    expect(convertGreekTyping('Qeos')).toBe('Θεος');
    expect(convertGreekTyping('PauloV')).toBe('Παυλος');
  });

  it('leaves non-mapped characters alone', () => {
    expect(convertGreekTyping('logoV, -ou, oJ')).toBe('λογος, -ου, ὁ');
  });

  it('leaves existing Unicode Greek untouched', () => {
    expect(convertGreekTyping('λόγος')).toBe('λόγος');
  });

  it('does not treat leading apostrophe as circumflex', () => {
    expect(convertGreekTyping("'logos")).toBe("'λογος");
  });
});

describe('normalizeGreek', () => {
  it('strips accents and breathings', () => {
    expect(normalizeGreek('λόγος')).toBe('λογοσ');
    expect(normalizeGreek('αὐτός')).toBe('αυτοσ');
  });

  it('lowercases and unifies sigma', () => {
    expect(normalizeGreek('Λόγος')).toBe('λογοσ');
  });

  it('makes accented and unaccented forms match', () => {
    expect(normalizeGreek('εὐαγγέλιον')).toBe(normalizeGreek('ευαγγελιον'));
  });
});
