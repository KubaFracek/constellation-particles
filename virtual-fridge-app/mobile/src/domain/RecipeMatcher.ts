import type { FridgeItem, MatchResult, Recipe } from './models';
import { jaccardSimilarity, normalizeIngredient, tokenize } from './utils';

const JACCARD_THRESHOLD = 0.6;
const EXPIRY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function buildSynonymIndex(synonyms: Map<string, string[]>): Map<string, string> {
  const index = new Map<string, string>();
  for (const [canonical, variants] of synonyms.entries()) {
    index.set(normalizeIngredient(canonical), canonical);
    for (const variant of variants) {
      index.set(normalizeIngredient(variant), canonical);
    }
  }
  return index;
}

function resolveCanonical(name: string, synonymIndex: Map<string, string>): string {
  const normalized = normalizeIngredient(name);
  return synonymIndex.get(normalized) ?? normalized;
}

function ingredientMatchesFridgeItem(
  ingredientName: string,
  fridgeItem: FridgeItem,
  synonymIndex: Map<string, string>,
): boolean {
  const ingredientCanonical = resolveCanonical(ingredientName, synonymIndex);
  const fridgeCanonical = resolveCanonical(fridgeItem.name, synonymIndex);

  if (ingredientCanonical === fridgeCanonical) return true;
  if (fridgeCanonical.includes(ingredientCanonical) || ingredientCanonical.includes(fridgeCanonical)) {
    return true;
  }

  for (const token of tokenize(fridgeItem.name)) {
    const tokenCanonical = resolveCanonical(token, synonymIndex);
    if (
      tokenCanonical === ingredientCanonical ||
      tokenCanonical.includes(ingredientCanonical) ||
      ingredientCanonical.includes(tokenCanonical)
    ) {
      return true;
    }
  }

  return jaccardSimilarity(ingredientName, fridgeItem.name) >= JACCARD_THRESHOLD;
}

function computeExpiryScore(usedItems: FridgeItem[], now = Date.now()): number {
  return usedItems.reduce((score, item) => {
    if (!item.expiresAt) return score;
    const delta = item.expiresAt - now;
    if (delta <= 0) return score + 3;
    if (delta <= EXPIRY_WINDOW_MS) return score + 2;
    return score;
  }, 0);
}

export function rankRecipes(
  recipes: Recipe[],
  fridgeItems: FridgeItem[],
  synonyms: Map<string, string[]>,
  now = Date.now(),
): MatchResult[] {
  const synonymIndex = buildSynonymIndex(synonyms);
  const availableItems = fridgeItems.filter((item) => item.quantity > 0);

  const results: MatchResult[] = recipes.map((recipe) => {
    const requiredIngredients = recipe.ingredients.filter((ingredient) => ingredient.required);
    const usedFridgeItemIds = new Set<string>();
    const missingIngredients: string[] = [];

    for (const ingredient of requiredIngredients) {
      const match = availableItems.find(
        (item) =>
          !usedFridgeItemIds.has(item.id) &&
          ingredientMatchesFridgeItem(ingredient.name, item, synonymIndex),
      );

      if (match) {
        usedFridgeItemIds.add(match.id);
      } else {
        missingIngredients.push(ingredient.name);
      }
    }

    const totalRequired = requiredIngredients.length || 1;
    const matchedRequired = totalRequired - missingIngredients.length;
    const coverage = matchedRequired / totalRequired;
    const usedItems = availableItems.filter((item) => usedFridgeItemIds.has(item.id));

    return {
      recipeId: recipe.id,
      title: recipe.title,
      coverage,
      missingIngredients,
      usedFridgeItemIds: [...usedFridgeItemIds],
      expiryScore: computeExpiryScore(usedItems, now),
      missingCount: missingIngredients.length,
      timeMinutes: recipe.timeMinutes,
      tags: recipe.tags,
    };
  });

  return results.sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    if (b.expiryScore !== a.expiryScore) return b.expiryScore - a.expiryScore;
    return a.missingCount - b.missingCount;
  });
}

export function categorizeMatches(results: MatchResult[]): Array<MatchResult & { category: 'ready' | 'almost' | 'other' }> {
  return results.map((result) => {
    let category: 'ready' | 'almost' | 'other' = 'other';
    if (result.coverage >= 1) category = 'ready';
    else if (result.missingCount <= 2 || result.coverage >= 0.8) category = 'almost';
    return { ...result, category };
  });
}

export function ingredientAvailability(
  ingredientName: string,
  fridgeItems: FridgeItem[],
  synonyms: Map<string, string[]>,
): FridgeItem | null {
  const synonymIndex = buildSynonymIndex(synonyms);
  return (
    fridgeItems.find(
      (item) => item.quantity > 0 && ingredientMatchesFridgeItem(ingredientName, item, synonymIndex),
    ) ?? null
  );
}

export { normalizeIngredient, tokenize, jaccardSimilarity };
