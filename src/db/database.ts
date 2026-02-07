import * as SQLite from 'expo-sqlite';
import { File, Paths, Directory } from 'expo-file-system/next';
import { Asset } from 'expo-asset';

const DB_NAME = 'FlashWorks.sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

function getDbDir(): Directory {
  return new Directory(Paths.document, 'databases');
}

function getDbPath(): string {
  return getDbDir().uri + '/' + DB_NAME;
}

/**
 * Ensures the database file exists in the writable document directory.
 * On first launch, copies from the bundled asset. Subsequent launches
 * use the existing copy (preserving difficulty updates).
 */
async function ensureDatabase(): Promise<void> {
  const dir = getDbDir();
  if (!dir.exists) {
    dir.create();
  }

  const dbFile = new File(getDbPath());
  if (!dbFile.exists) {
    const asset = Asset.fromModule(
      require('../../assets/databases/FlashWorks.sqlite')
    );
    await asset.downloadAsync();
    if (!asset.localUri) {
      throw new Error('Failed to resolve database asset URI');
    }
    const sourceFile = new File(asset.localUri);
    sourceFile.copy(dbFile);
  }
}

/** Opens (or returns cached) database connection */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  await ensureDatabase();
  dbInstance = await SQLite.openDatabaseAsync(getDbPath());
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
  const dbFile = new File(getDbPath());
  if (dbFile.exists) {
    dbFile.delete();
  }
  await ensureDatabase();
  dbInstance = await SQLite.openDatabaseAsync(getDbPath());
}

/** Returns the path to the current database file (for export) */
export function getDatabasePath(): string {
  return getDbPath();
}
