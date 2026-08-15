import type { SQLiteDatabase } from 'expo-sqlite';

import type { Recipe, RecipeIngredient } from '../../domain/models';
import seedRecipes from '../../../assets/recipes/pl.json';

interface RecipeRow {
  id: string;
  title: string;
  steps_json: string;
  time_minutes: number;
  tags: string | null;
}

interface IngredientRow {
  recipe_id: string;
  name: string;
  amount: number;
  unit: string;
  required: number;
}

const DEFAULT_SYNONYMS: Record<string, string[]> = {
  jajko: ['jajka', 'jajko kurze', 'jajka kurze'],
  maslo: ['masło', 'masełko'],
  mleko: ['mleko 2%', 'mleko 3.2%'],
  pomidor: ['pomidory', 'pomidor malinowy'],
  cebula: ['cebulka', 'cebula biala', 'cebula biała'],
  czosnek: ['ząbek czosnku', 'zaabek czosnku', 'czosnek'],
  ser: ['ser żółty', 'ser zolty', 'ser biały', 'twaróg', 'twarog'],
  makaron: ['spaghetti', 'penne', 'fusilli'],
  ryż: ['ryz', 'ryż biały', 'ryz bialy'],
  kurczak: ['pierś z kurczaka', 'pierś kurczaka', 'filet z kurczaka'],
  marchew: ['marchewka', 'marchewki'],
  ziemniak: ['ziemniaki', 'kartofel', 'kartofle'],
  papryka: ['papryka czerwona', 'papryka zielona'],
  szpinak: ['szpinak świeży', 'szpinak swiezy'],
  jogurt: ['jogurt naturalny'],
  smietana: ['śmietana', 'śmietana 18%'],
  olej: ['olej rzepakowy', 'oliwa', 'oliwa z oliwek'],
  mąka: ['maka', 'mąka pszenna', 'maka pszenna'],
  cukier: ['cukier biały', 'cukier bialy'],
  ogórek: ['ogorek', 'ogórki', 'ogorki'],
  szynka: ['szynka wieprzowa'],
  pieczarka: ['pieczarki', 'grzyby'],
  brokuł: ['brokul', 'brokuły', 'brokuly'],
  łosoś: ['losos', 'łosoś wędzony', 'losos wedzony'],
  cytryna: ['cytryny', 'sok z cytryny'],
  bazylia: ['bazylia świeża', 'bazylia swieza'],
  cukinia: ['cukinia zielona'],
  fasola: ['fasola czerwona', 'fasola biała', 'fasola biala'],
  boczek: ['boczek wędzony', 'boczek wedzony'],
};

export async function seedDatabaseIfNeeded(db: SQLiteDatabase): Promise<void> {
  const recipeCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recipes',
  );

  if ((recipeCount?.count ?? 0) > 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const recipe of seedRecipes.recipes) {
      await db.runAsync(
        'INSERT INTO recipes (id, title, steps_json, time_minutes, tags) VALUES (?, ?, ?, ?, ?)',
        [
          recipe.id,
          recipe.title,
          JSON.stringify(recipe.steps),
          recipe.time_minutes,
          JSON.stringify(recipe.tags),
        ],
      );

      for (const ingredient of recipe.ingredients) {
        await db.runAsync(
          `INSERT INTO recipe_ingredients (recipe_id, name, amount, unit, required)
           VALUES (?, ?, ?, ?, ?)`,
          [
            recipe.id,
            ingredient.name,
            ingredient.amount,
            ingredient.unit,
            ingredient.required ? 1 : 0,
          ],
        );
      }
    }

    for (const [canonical, variants] of Object.entries(DEFAULT_SYNONYMS)) {
      for (const variant of variants) {
        await db.runAsync(
          'INSERT OR IGNORE INTO ingredient_synonyms (canonical, variant) VALUES (?, ?)',
          [canonical, variant],
        );
      }
    }
  });
}

export async function listRecipes(db: SQLiteDatabase): Promise<Recipe[]> {
  const recipeRows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes ORDER BY title ASC');
  const ingredientRows = await db.getAllAsync<IngredientRow>(
    'SELECT * FROM recipe_ingredients ORDER BY id ASC',
  );

  const ingredientsByRecipe = new Map<string, RecipeIngredient[]>();
  for (const row of ingredientRows) {
    const list = ingredientsByRecipe.get(row.recipe_id) ?? [];
    list.push({
      name: row.name,
      amount: row.amount,
      unit: row.unit,
      required: row.required === 1,
    });
    ingredientsByRecipe.set(row.recipe_id, list);
  }

  return recipeRows.map((row) => ({
    id: row.id,
    title: row.title,
    steps: JSON.parse(row.steps_json) as string[],
    timeMinutes: row.time_minutes,
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    ingredients: ingredientsByRecipe.get(row.id) ?? [],
  }));
}

export async function getRecipe(db: SQLiteDatabase, id: string): Promise<Recipe | null> {
  const recipes = await listRecipes(db);
  return recipes.find((recipe) => recipe.id === id) ?? null;
}

export async function loadSynonyms(db: SQLiteDatabase): Promise<Map<string, string[]>> {
  const rows = await db.getAllAsync<{ canonical: string; variant: string }>(
    'SELECT canonical, variant FROM ingredient_synonyms',
  );
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const variants = map.get(row.canonical) ?? [];
    variants.push(row.variant);
    map.set(row.canonical, variants);
  }
  return map;
}
