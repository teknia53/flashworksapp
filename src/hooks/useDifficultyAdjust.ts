import type { FlashWord, DifficultyUpdate } from '../db/types';

/**
 * Implements the Xojo counter-based difficulty adjustment algorithm.
 *
 * Counter range: 1-7 (starts at 4 = neutral)
 * Difficulty range: 1 (easiest) to 5 (hardest)
 *
 * RIGHT: counter++ → if reaches 7: difficulty-1, reset counter to 4
 * WRONG: counter-- → if reaches 1: difficulty+1, reset counter to 4
 */
export function adjustDifficulty(
  word: FlashWord,
  answer: 'right' | 'wrong',
  globalAutoEnabled: boolean
): DifficultyUpdate {
  const autoEnabled = globalAutoEnabled && word.dbSetDiffWordAuto === 1;

  if (!autoEnabled) {
    // No adjustment — return unchanged
    return {
      dbSequence: word.dbSequence,
      dbDifficulty: word.dbDifficulty,
      dbCounter: word.dbCounter,
      dbSetDiffWordAuto: word.dbSetDiffWordAuto,
    };
  }

  let counter = word.dbCounter;
  let difficulty = word.dbDifficulty;

  if (answer === 'right') {
    counter += 1;
    if (counter >= 7) {
      if (difficulty > 1) {
        difficulty -= 1;
        counter = 4;
      } else {
        // Already at easiest — clamp counter
        counter = 1;
      }
    }
  } else {
    // wrong
    counter -= 1;
    if (counter <= 1) {
      if (difficulty < 5) {
        difficulty += 1;
        counter = 4;
      } else {
        // Already at hardest — clamp counter
        counter = 7;
      }
    }
  }

  return {
    dbSequence: word.dbSequence,
    dbDifficulty: difficulty,
    dbCounter: counter,
    dbSetDiffWordAuto: word.dbSetDiffWordAuto,
  };
}
