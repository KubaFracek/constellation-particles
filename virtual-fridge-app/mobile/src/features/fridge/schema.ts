import { z } from 'zod';

export const fridgeItemSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę produktu'),
  barcode: z.string().trim().optional(),
  quantity: z.number().positive('Ilość musi być większa od 0'),
  unit: z.string().trim().min(1, 'Podaj jednostkę'),
  category: z.string().trim().optional(),
  expiry: z.string().trim().optional(),
});

export type FridgeItemFormValues = z.infer<typeof fridgeItemSchema>;

export function parseExpiryDate(value?: string): number | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}
