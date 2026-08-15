import { useQuery } from '@tanstack/react-query';

import { categorizeMatches, rankRecipes } from '../domain/RecipeMatcher';
import { getRecipe, listRecipes, loadSynonyms } from '../data/repositories/RecipeRepository';
import { useDatabase } from '../providers/DatabaseContext';
import { useFridgeItems } from './useFridge';

export function useRecipes() {
  const db = useDatabase();

  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => listRecipes(db),
  });
}

export function useRecipe(id: string | undefined) {
  const db = useDatabase();

  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => (id ? getRecipe(db, id) : null),
    enabled: Boolean(id),
  });
}

export function useRecipeMatches() {
  const db = useDatabase();
  const { data: fridgeItems = [] } = useFridgeItems();
  const { data: recipes = [], isLoading: recipesLoading } = useRecipes();

  return useQuery({
    queryKey: ['recipe-matches', fridgeItems.map((item) => `${item.id}:${item.quantity}`).join('|')],
    queryFn: async () => {
      const synonyms = await loadSynonyms(db);
      const ranked = rankRecipes(recipes, fridgeItems, synonyms);
      return categorizeMatches(ranked);
    },
    enabled: !recipesLoading,
  });
}
