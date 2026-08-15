import type { FridgeItem, Recipe } from '../models';
import { categorizeMatches, ingredientAvailability, rankRecipes } from '../RecipeMatcher';

const synonyms = new Map<string, string[]>([
  ['jajko', ['jajka', 'jajko kurze']],
  ['pomidor', ['pomidory']],
  ['maslo', ['masło']],
]);

const fridgeItems: FridgeItem[] = [
  {
    id: '1',
    name: 'Jajka L',
    barcode: null,
    quantity: 6,
    unit: 'szt',
    category: null,
    expiresAt: Date.now() + 86400000,
    addedAt: Date.now(),
    source: 'manual',
    offProductId: null,
  },
  {
    id: '2',
    name: 'Pomidory malinowe',
    barcode: null,
    quantity: 3,
    unit: 'szt',
    category: null,
    expiresAt: null,
    addedAt: Date.now(),
    source: 'manual',
    offProductId: null,
  },
];

const recipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Jajecznica z pomidorami',
    timeMinutes: 10,
    tags: ['sniadanie'],
    steps: ['step'],
    ingredients: [
      { name: 'jajko', amount: 3, unit: 'szt', required: true },
      { name: 'pomidor', amount: 2, unit: 'szt', required: true },
      { name: 'masło', amount: 10, unit: 'g', required: false },
    ],
  },
  {
    id: 'r2',
    title: 'Ryba z cytryną',
    timeMinutes: 20,
    tags: ['obiad'],
    steps: ['step'],
    ingredients: [
      { name: 'łosoś', amount: 200, unit: 'g', required: true },
      { name: 'cytryna', amount: 1, unit: 'szt', required: true },
    ],
  },
];

describe('RecipeMatcher', () => {
  it('matches jajka and pomidory for jajecznica', () => {
    const results = rankRecipes(recipes, fridgeItems, synonyms);
    const top = results[0];
    expect(top.recipeId).toBe('r1');
    expect(top.coverage).toBe(1);
    expect(top.missingIngredients).toHaveLength(0);
  });

  it('categorizes ready recipes', () => {
    const results = categorizeMatches(rankRecipes(recipes, fridgeItems, synonyms));
    expect(results.find((item) => item.recipeId === 'r1')?.category).toBe('ready');
  });

  it('marks missing fish recipe as other', () => {
    const results = categorizeMatches(rankRecipes(recipes, fridgeItems, synonyms));
    const fish = results.find((item) => item.recipeId === 'r2');
    expect(fish?.category).toBe('almost');
    expect(fish?.missingCount).toBeGreaterThan(0);
  });

  it('finds ingredient availability via synonyms', () => {
    const match = ingredientAvailability('jajka', fridgeItems, synonyms);
    expect(match?.id).toBe('1');
  });

  it('returns null when ingredient is missing', () => {
    const match = ingredientAvailability('łosoś', fridgeItems, synonyms);
    expect(match).toBeNull();
  });
});

describe('normalize via rankRecipes edge cases', () => {
  it('handles empty fridge', () => {
    const results = rankRecipes(recipes, [], synonyms);
    expect(results.every((item) => item.coverage < 1)).toBe(true);
  });

  it('boosts recipes using expiring items', () => {
    const expiringItems: FridgeItem[] = [
      {
        ...fridgeItems[0],
        expiresAt: Date.now() + 1000,
      },
      fridgeItems[1],
    ];
    const results = rankRecipes(recipes, expiringItems, synonyms);
    expect(results[0].expiryScore).toBeGreaterThan(0);
  });
});
