import * as SQLite from 'expo-sqlite';

const DB_NAME = 'wirtualna_lodowka.db';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return databasePromise;
}

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS fridge_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      barcode TEXT,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'szt',
      category TEXT,
      expires_at INTEGER,
      added_at INTEGER NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      off_product_id TEXT
    );

    CREATE TABLE IF NOT EXISTS products_cache (
      barcode TEXT PRIMARY KEY NOT NULL,
      json TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      steps_json TEXT NOT NULL,
      time_minutes INTEGER NOT NULL DEFAULT 30,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'szt',
      required INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredient_synonyms (
      canonical TEXT NOT NULL,
      variant TEXT NOT NULL,
      PRIMARY KEY (canonical, variant)
    );
  `);

  return db;
}
