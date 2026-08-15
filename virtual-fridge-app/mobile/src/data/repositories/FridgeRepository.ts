import type { SQLiteDatabase } from 'expo-sqlite';

import type { FridgeItem, FridgeItemSource, NewFridgeItemInput } from '../../domain/models';
import { generateId } from '../../domain/utils';

interface FridgeItemRow {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number;
  unit: string;
  category: string | null;
  expires_at: number | null;
  added_at: number;
  source: FridgeItemSource;
  off_product_id: string | null;
}

function mapRow(row: FridgeItemRow): FridgeItem {
  return {
    id: row.id,
    name: row.name,
    barcode: row.barcode,
    quantity: row.quantity,
    unit: row.unit,
    category: row.category,
    expiresAt: row.expires_at,
    addedAt: row.added_at,
    source: row.source,
    offProductId: row.off_product_id,
  };
}

export async function listFridgeItems(db: SQLiteDatabase): Promise<FridgeItem[]> {
  const rows = await db.getAllAsync<FridgeItemRow>(
    'SELECT * FROM fridge_items ORDER BY added_at DESC',
  );
  return rows.map(mapRow);
}

export async function getFridgeItem(db: SQLiteDatabase, id: string): Promise<FridgeItem | null> {
  const row = await db.getFirstAsync<FridgeItemRow>('SELECT * FROM fridge_items WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function addFridgeItem(db: SQLiteDatabase, input: NewFridgeItemInput): Promise<FridgeItem> {
  const item: FridgeItem = {
    id: generateId(),
    name: input.name.trim(),
    barcode: input.barcode ?? null,
    quantity: input.quantity,
    unit: input.unit,
    category: input.category ?? null,
    expiresAt: input.expiresAt ?? null,
    addedAt: Date.now(),
    source: input.source,
    offProductId: input.offProductId ?? null,
  };

  await db.runAsync(
    `INSERT INTO fridge_items
      (id, name, barcode, quantity, unit, category, expires_at, added_at, source, off_product_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.barcode,
      item.quantity,
      item.unit,
      item.category,
      item.expiresAt,
      item.addedAt,
      item.source,
      item.offProductId,
    ],
  );

  return item;
}

export async function updateFridgeItem(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<Pick<FridgeItem, 'name' | 'quantity' | 'unit' | 'category' | 'expiresAt'>>,
): Promise<void> {
  const existing = await getFridgeItem(db, id);
  if (!existing) return;

  await db.runAsync(
    `UPDATE fridge_items
     SET name = ?, quantity = ?, unit = ?, category = ?, expires_at = ?
     WHERE id = ?`,
    [
      patch.name ?? existing.name,
      patch.quantity ?? existing.quantity,
      patch.unit ?? existing.unit,
      patch.category ?? existing.category,
      patch.expiresAt !== undefined ? patch.expiresAt : existing.expiresAt,
      id,
    ],
  );
}

export async function deleteFridgeItem(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM fridge_items WHERE id = ?', [id]);
}

export async function consumeIngredients(
  db: SQLiteDatabase,
  deductions: Array<{ fridgeItemId: string; amount: number }>,
): Promise<void> {
  for (const deduction of deductions) {
    const item = await getFridgeItem(db, deduction.fridgeItemId);
    if (!item) continue;
    const nextQuantity = Math.max(0, item.quantity - deduction.amount);
    await updateFridgeItem(db, item.id, { quantity: nextQuantity });
  }
}
