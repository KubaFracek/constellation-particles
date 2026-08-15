import type { SQLiteDatabase } from 'expo-sqlite';

import type { OffProduct } from '../../domain/models';

interface CacheRow {
  barcode: string;
  json: string;
  fetched_at: number;
}

export async function getCachedProduct(
  db: SQLiteDatabase,
  barcode: string,
): Promise<OffProduct | null> {
  const row = await db.getFirstAsync<CacheRow>(
    'SELECT * FROM products_cache WHERE barcode = ?',
    [barcode],
  );
  if (!row) return null;
  return JSON.parse(row.json) as OffProduct;
}

export async function cacheProduct(db: SQLiteDatabase, product: OffProduct): Promise<void> {
  await db.runAsync(
    `INSERT INTO products_cache (barcode, json, fetched_at)
     VALUES (?, ?, ?)
     ON CONFLICT(barcode) DO UPDATE SET json = excluded.json, fetched_at = excluded.fetched_at`,
    [product.barcode, JSON.stringify(product), Date.now()],
  );
}

export async function lookupProduct(
  db: SQLiteDatabase,
  barcode: string,
  fetcher: (barcode: string) => Promise<OffProduct | null>,
): Promise<OffProduct | null> {
  const cached = await getCachedProduct(db, barcode);
  if (cached) return cached;

  const fetched = await fetcher(barcode);
  if (fetched) {
    await cacheProduct(db, fetched);
  }
  return fetched;
}
