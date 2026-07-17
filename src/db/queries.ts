import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  FlashWord,
  CodesConfig,
  WordFilter,
  DifficultyUpdate,
  WordType,
} from './types';

// ─── Config (CODES table) ───────────────────────────────────────────

export async function getConfig(db: SQLiteDatabase): Promise<CodesConfig> {
  const row = await db.getFirstAsync<CodesConfig>(
    'SELECT * FROM codes LIMIT 1'
  );
  if (!row) throw new Error('No config row found in codes table');
  return row;
}

export async function updateConfig(
  db: SQLiteDatabase,
  updates: Partial<CodesConfig>
): Promise<void> {
  const keys = Object.keys(updates) as (keyof CodesConfig)[];
  if (keys.length === 0) return;

  const setClauses = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => updates[k] as string | number);

  await db.runAsync(
    `UPDATE codes SET ${setClauses} WHERE dbSequenceCode = 1`,
    ...values
  );
}

// ─── Words (FLASH table) ────────────────────────────────────────────

/**
 * Builds and executes the filtered word query.
 * Mirrors the Xojo wordsWetzel() function.
 */
export async function getFilteredWords(
  db: SQLiteDatabase,
  filter: WordFilter
): Promise<FlashWord[]> {
  let sql = `SELECT * FROM flash WHERE dbDifficulty BETWEEN ? AND ?`;
  const params: (string | number)[] = [filter.lowDiff, filter.highDiff];

  if (filter.searchChapter) {
    sql += ` AND dbChapter BETWEEN ? AND ?`;
    params.push(filter.lowChpt, filter.highChpt);
  }

  if (filter.searchFrequency) {
    sql += ` AND dbFrequency BETWEEN ? AND ?`;
    params.push(filter.lowFreq, filter.highFreq);
  }

  if (filter.searchType && filter.enabledTypes.length > 0) {
    const placeholders = filter.enabledTypes.map(() => '?').join(', ');
    sql += ` AND dbType IN (${placeholders})`;
    params.push(...filter.enabledTypes);
  }

  sql += ` ORDER BY dbChapter, dbSequence`;

  return db.getAllAsync<FlashWord>(sql, ...params);
}

/** Get all words unfiltered (for Library screen) */
export async function getAllWords(db: SQLiteDatabase): Promise<FlashWord[]> {
  return db.getAllAsync<FlashWord>(
    'SELECT * FROM flash ORDER BY dbChapter, dbSequence'
  );
}

/** Get single word by sequence ID */
export async function getWord(
  db: SQLiteDatabase,
  dbSequence: number
): Promise<FlashWord | null> {
  return db.getFirstAsync<FlashWord>(
    'SELECT * FROM flash WHERE dbSequence = ?',
    dbSequence
  );
}

/** Get count of words matching current filter */
export async function getFilteredWordCount(
  db: SQLiteDatabase,
  filter: WordFilter
): Promise<number> {
  let sql = `SELECT COUNT(*) as count FROM flash WHERE dbDifficulty BETWEEN ? AND ?`;
  const params: (string | number)[] = [filter.lowDiff, filter.highDiff];

  if (filter.searchChapter) {
    sql += ` AND dbChapter BETWEEN ? AND ?`;
    params.push(filter.lowChpt, filter.highChpt);
  }

  if (filter.searchFrequency) {
    sql += ` AND dbFrequency BETWEEN ? AND ?`;
    params.push(filter.lowFreq, filter.highFreq);
  }

  if (filter.searchType && filter.enabledTypes.length > 0) {
    const placeholders = filter.enabledTypes.map(() => '?').join(', ');
    sql += ` AND dbType IN (${placeholders})`;
    params.push(...filter.enabledTypes);
  }

  const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
  return result?.count ?? 0;
}

// ─── Difficulty Updates ─────────────────────────────────────────────

/** Batch-update difficulty, counter, and auto flag for multiple words */
export async function saveDifficultyUpdates(
  db: SQLiteDatabase,
  updates: DifficultyUpdate[]
): Promise<void> {
  if (updates.length === 0) return;

  await db.withTransactionAsync(async () => {
    for (const u of updates) {
      await db.runAsync(
        `UPDATE flash SET dbDifficulty = ?, dbCounter = ?, dbSetDiffWordAuto = ? WHERE dbSequence = ?`,
        u.dbDifficulty,
        u.dbCounter,
        u.dbSetDiffWordAuto,
        u.dbSequence
      );
    }
  });
}

/** Update a single word's difficulty info */
export async function saveSingleDifficulty(
  db: SQLiteDatabase,
  update: DifficultyUpdate
): Promise<void> {
  await db.runAsync(
    `UPDATE flash SET dbDifficulty = ?, dbCounter = ?, dbSetDiffWordAuto = ? WHERE dbSequence = ?`,
    update.dbDifficulty,
    update.dbCounter,
    update.dbSetDiffWordAuto,
    update.dbSequence
  );
}

// ─── Word CRUD (for Library) ────────────────────────────────────────

export async function addWord(
  db: SQLiteDatabase,
  word: Omit<FlashWord, 'dbSequence'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO flash (dbChapter, dbGK, dbDifficulty, dbFrequency, dbType,
     dbSetDiffWordAuto, dbCounter, dbWord, dbSayWordFile, dbMeaning, dbPrincipalParts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    word.dbChapter,
    word.dbGK,
    word.dbDifficulty,
    word.dbFrequency,
    word.dbType,
    word.dbSetDiffWordAuto,
    word.dbCounter,
    word.dbWord,
    word.dbSayWordFile,
    word.dbMeaning,
    word.dbPrincipalParts
  );
  return result.lastInsertRowId;
}

export async function updateWord(
  db: SQLiteDatabase,
  word: FlashWord
): Promise<void> {
  await db.runAsync(
    `UPDATE flash SET dbChapter = ?, dbGK = ?, dbDifficulty = ?, dbFrequency = ?,
     dbType = ?, dbSetDiffWordAuto = ?, dbCounter = ?, dbWord = ?,
     dbSayWordFile = ?, dbMeaning = ?, dbPrincipalParts = ?
     WHERE dbSequence = ?`,
    word.dbChapter,
    word.dbGK,
    word.dbDifficulty,
    word.dbFrequency,
    word.dbType,
    word.dbSetDiffWordAuto,
    word.dbCounter,
    word.dbWord,
    word.dbSayWordFile,
    word.dbMeaning,
    word.dbPrincipalParts,
    word.dbSequence
  );
}

export async function deleteWord(
  db: SQLiteDatabase,
  dbSequence: number
): Promise<void> {
  await db.runAsync('DELETE FROM flash WHERE dbSequence = ?', dbSequence);
}

// ─── Aggregate Queries ──────────────────────────────────────────────

export async function getTotalWordCount(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM flash'
  );
  return result?.count ?? 0;
}

export async function getChapterRange(
  db: SQLiteDatabase
): Promise<{ min: number; max: number }> {
  const result = await db.getFirstAsync<{ min: number; max: number }>(
    'SELECT MIN(dbChapter) as min, MAX(dbChapter) as max FROM flash'
  );
  return result ?? { min: 1, max: 99 };
}

export async function getFrequencyRange(
  db: SQLiteDatabase
): Promise<{ min: number; max: number }> {
  const result = await db.getFirstAsync<{ min: number; max: number }>(
    'SELECT MIN(dbFrequency) as min, MAX(dbFrequency) as max FROM flash'
  );
  return result ?? { min: 1, max: 99999 };
}

/** Search words by Greek text or meaning */
export async function searchWords(
  db: SQLiteDatabase,
  query: string
): Promise<FlashWord[]> {
  const pattern = `%${query}%`;
  return db.getAllAsync<FlashWord>(
    `SELECT * FROM flash WHERE dbWord LIKE ? OR dbMeaning LIKE ? ORDER BY dbChapter, dbSequence`,
    pattern,
    pattern
  );
}

// ─── Missed words (persisted per most-recent session) ───────────────

export async function clearMissedWords(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM missed');
}

export async function addMissedWord(
  db: SQLiteDatabase,
  dbSequence: number
): Promise<void> {
  await db.runAsync(
    'INSERT OR IGNORE INTO missed (dbSequence) VALUES (?)',
    dbSequence
  );
}

export async function getMissedWords(db: SQLiteDatabase): Promise<FlashWord[]> {
  return db.getAllAsync<FlashWord>(
    `SELECT flash.* FROM flash
     JOIN missed ON flash.dbSequence = missed.dbSequence
     ORDER BY flash.dbChapter, flash.dbSequence`
  );
}

export async function getMissedCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM missed'
  );
  return row?.n ?? 0;
}
