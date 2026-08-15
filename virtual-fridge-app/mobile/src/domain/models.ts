export type FridgeItemSource = 'scan' | 'manual' | 'import';

export interface FridgeItem {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number;
  unit: string;
  category: string | null;
  expiresAt: number | null;
  addedAt: number;
  source: FridgeItemSource;
  offProductId: string | null;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  required: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  timeMinutes: number;
  tags: string[];
}

export interface MatchResult {
  recipeId: string;
  title: string;
  coverage: number;
  missingIngredients: string[];
  usedFridgeItemIds: string[];
  expiryScore: number;
  missingCount: number;
  timeMinutes: number;
  tags: string[];
}

export type RecipeMatchCategory = 'ready' | 'almost' | 'other';

export interface CategorizedMatch extends MatchResult {
  category: RecipeMatchCategory;
}

export interface OffProduct {
  barcode: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  offProductId: string;
  quantityHint: string | null;
}

export interface NewFridgeItemInput {
  name: string;
  barcode?: string | null;
  quantity: number;
  unit: string;
  category?: string | null;
  expiresAt?: number | null;
  source: FridgeItemSource;
  offProductId?: string | null;
}
