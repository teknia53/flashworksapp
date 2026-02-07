import { adjustDifficulty } from '../hooks/useDifficultyAdjust';
import type { FlashWord } from '../db/types';

function makeWord(overrides: Partial<FlashWord> = {}): FlashWord {
  return {
    dbSequence: 1,
    dbChapter: 4,
    dbGK: 100,
    dbDifficulty: 3,
    dbFrequency: 50,
    dbType: 'N',
    dbSetDiffWordAuto: 1,
    dbCounter: 4,
    dbWord: 'test',
    dbSayWordFile: '',
    dbMeaning: 'test meaning',
    dbPrincipalParts: '',
    ...overrides,
  };
}

describe('adjustDifficulty', () => {
  describe('when auto-difficulty is disabled globally', () => {
    it('returns unchanged values', () => {
      const word = makeWord({ dbDifficulty: 3, dbCounter: 4 });
      const result = adjustDifficulty(word, 'right', false);
      expect(result.dbDifficulty).toBe(3);
      expect(result.dbCounter).toBe(4);
    });
  });

  describe('when auto-difficulty is disabled per-word', () => {
    it('returns unchanged values', () => {
      const word = makeWord({ dbDifficulty: 3, dbCounter: 4, dbSetDiffWordAuto: 0 });
      const result = adjustDifficulty(word, 'right', true);
      expect(result.dbDifficulty).toBe(3);
      expect(result.dbCounter).toBe(4);
    });
  });

  describe('right answer', () => {
    it('increments counter', () => {
      const word = makeWord({ dbCounter: 4 });
      const result = adjustDifficulty(word, 'right', true);
      expect(result.dbCounter).toBe(5);
    });

    it('decreases difficulty when counter reaches 7', () => {
      const word = makeWord({ dbCounter: 6, dbDifficulty: 3 });
      const result = adjustDifficulty(word, 'right', true);
      expect(result.dbDifficulty).toBe(2);
      expect(result.dbCounter).toBe(4); // reset to middle
    });

    it('clamps counter to 1 at minimum difficulty', () => {
      const word = makeWord({ dbCounter: 6, dbDifficulty: 1 });
      const result = adjustDifficulty(word, 'right', true);
      expect(result.dbDifficulty).toBe(1); // already easiest
      expect(result.dbCounter).toBe(1); // clamp
    });
  });

  describe('wrong answer', () => {
    it('decrements counter', () => {
      const word = makeWord({ dbCounter: 4 });
      const result = adjustDifficulty(word, 'wrong', true);
      expect(result.dbCounter).toBe(3);
    });

    it('increases difficulty when counter reaches 1', () => {
      const word = makeWord({ dbCounter: 2, dbDifficulty: 3 });
      const result = adjustDifficulty(word, 'wrong', true);
      expect(result.dbDifficulty).toBe(4);
      expect(result.dbCounter).toBe(4); // reset to middle
    });

    it('clamps counter to 7 at maximum difficulty', () => {
      const word = makeWord({ dbCounter: 2, dbDifficulty: 5 });
      const result = adjustDifficulty(word, 'wrong', true);
      expect(result.dbDifficulty).toBe(5); // already hardest
      expect(result.dbCounter).toBe(7); // clamp
    });
  });

  describe('full cycle: 3 rights decrease difficulty', () => {
    it('goes from difficulty 3 → 2 after 3 consecutive right answers', () => {
      let word = makeWord({ dbCounter: 4, dbDifficulty: 3 });
      // Right 1: counter 4→5
      let r = adjustDifficulty(word, 'right', true);
      expect(r.dbCounter).toBe(5);
      word = { ...word, dbCounter: r.dbCounter, dbDifficulty: r.dbDifficulty };

      // Right 2: counter 5→6
      r = adjustDifficulty(word, 'right', true);
      expect(r.dbCounter).toBe(6);
      word = { ...word, dbCounter: r.dbCounter, dbDifficulty: r.dbDifficulty };

      // Right 3: counter 6→7 → triggers difficulty decrease, reset to 4
      r = adjustDifficulty(word, 'right', true);
      expect(r.dbDifficulty).toBe(2);
      expect(r.dbCounter).toBe(4);
    });
  });

  describe('full cycle: 3 wrongs increase difficulty', () => {
    it('goes from difficulty 3 → 4 after 3 consecutive wrong answers', () => {
      let word = makeWord({ dbCounter: 4, dbDifficulty: 3 });
      // Wrong 1: counter 4→3
      let r = adjustDifficulty(word, 'wrong', true);
      expect(r.dbCounter).toBe(3);
      word = { ...word, dbCounter: r.dbCounter, dbDifficulty: r.dbDifficulty };

      // Wrong 2: counter 3→2
      r = adjustDifficulty(word, 'wrong', true);
      expect(r.dbCounter).toBe(2);
      word = { ...word, dbCounter: r.dbCounter, dbDifficulty: r.dbDifficulty };

      // Wrong 3: counter 2→1 → triggers difficulty increase, reset to 4
      r = adjustDifficulty(word, 'wrong', true);
      expect(r.dbDifficulty).toBe(4);
      expect(r.dbCounter).toBe(4);
    });
  });
});
