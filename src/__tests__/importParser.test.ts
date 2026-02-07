import { parseTabDelimited } from '../utils/importParser';

describe('parseTabDelimited', () => {
  it('parses basic word and meaning', () => {
    const result = parseTabDelimited('ἄγγελος\tangel');
    expect(result).toHaveLength(1);
    expect(result[0].dbWord).toBe('ἄγγελος');
    expect(result[0].dbMeaning).toBe('angel');
  });

  it('parses full row with all fields', () => {
    const result = parseTabDelimited('ἄγγελος\tangel; messenger\tN\t4\t175\t');
    expect(result[0].dbWord).toBe('ἄγγελος');
    expect(result[0].dbMeaning).toBe('angel; messenger');
    expect(result[0].dbType).toBe('N');
    expect(result[0].dbChapter).toBe(4);
    expect(result[0].dbFrequency).toBe(175);
  });

  it('handles multiple lines', () => {
    const text = 'ἄγγελος\tangel\nἀμήν\tverily\nἄνθρωπος\tman';
    const result = parseTabDelimited(text);
    expect(result).toHaveLength(3);
    expect(result[2].dbWord).toBe('ἄνθρωπος');
  });

  it('skips empty lines', () => {
    const text = 'ἄγγελος\tangel\n\n\nἀμήν\tverily';
    const result = parseTabDelimited(text);
    expect(result).toHaveLength(2);
  });

  it('defaults missing fields', () => {
    const result = parseTabDelimited('word\tmeaning');
    expect(result[0].dbType).toBe('O'); // default
    expect(result[0].dbChapter).toBe(0);
    expect(result[0].dbFrequency).toBe(0);
    expect(result[0].dbDifficulty).toBe(3); // default mid
    expect(result[0].dbCounter).toBe(4); // default neutral
    expect(result[0].dbSetDiffWordAuto).toBe(1); // auto enabled
  });
});
