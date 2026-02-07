import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

const DB_NAME = 'FlashWorks.sqlite';

// expo-sqlite default directory
const SQL_DIR = FileSystem.documentDirectory + 'SQLite/';
const DB_PATH = SQL_DIR + DB_NAME;

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Ensures the database file exists in the writable document directory.
 * On first launch, copies from the bundled asset. Subsequent launches
 * use the existing copy (preserving difficulty updates).
 */
async function ensureDatabase(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(SQL_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SQL_DIR, { intermediates: true });
  }

  const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
  if (!fileInfo.exists || fileInfo.size === 0) {
    // Remove stale empty file if it exists
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(DB_PATH);
    }
    const asset = Asset.fromModule(
      require('../../assets/databases/FlashWorks.sqlite')
    );
    await asset.downloadAsync();
    if (!asset.localUri) {
      throw new Error('Failed to resolve database asset URI');
    }
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: DB_PATH,
    });
  }
}

/** Opens (or returns cached) database connection */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  await ensureDatabase();
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  return dbInstance;
}

/** Closes the database connection */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

/**
 * Resets the database by deleting the document copy and
 * re-copying from the bundled asset.
 */
export async function resetDatabase(): Promise<void> {
  await closeDatabase();
  const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(DB_PATH);
  }
  await ensureDatabase();
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
}

/** Returns the path to the current database file (for export) */
export function getDatabasePath(): string {
  return DB_PATH;
}
