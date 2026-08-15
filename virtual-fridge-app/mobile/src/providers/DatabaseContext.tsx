import { createContext, useContext } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

export const DatabaseContext = createContext<SQLiteDatabase | null>(null);

export function useDatabase(): SQLiteDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('Database is not initialized');
  }
  return db;
}
