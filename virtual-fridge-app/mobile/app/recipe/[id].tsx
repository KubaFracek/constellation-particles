import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, List, Text } from 'react-native-paper';

import { ingredientAvailability } from '@/src/domain/RecipeMatcher';
import { useFridgeItems, useFridgeMutations } from '@/src/hooks/useFridge';
import { useRecipe } from '@/src/hooks/useRecipes';
import { useDatabase } from '@/src/providers/DatabaseContext';
import { loadSynonyms } from '@/src/data/repositories/RecipeRepository';
import { useQuery } from '@tanstack/react-query';

export default function RecipeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const { data: recipe, isLoading } = useRecipe(id);
  const { data: fridgeItems = [] } = useFridgeItems();
  const { consume } = useFridgeMutations();

  const { data: synonyms = new Map<string, string[]>() } = useQuery({
    queryKey: ['synonyms'],
    queryFn: () => loadSynonyms(db),
  });

  const deductions = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients
      .map((ingredient) => {
        const match = ingredientAvailability(ingredient.name, fridgeItems, synonyms);
        if (!match) return null;
        return { fridgeItemId: match.id, amount: ingredient.amount };
      })
      .filter(Boolean) as Array<{ fridgeItemId: string; amount: number }>;
  }, [recipe, fridgeItems, synonyms]);

  if (isLoading || !recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleCooked = async () => {
    if (deductions.length === 0) return;
    await consume.mutateAsync(deductions);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">{recipe.title}</Text>
      <Text style={styles.meta}>
        {recipe.timeMinutes} {t('recipes.minutes')}
      </Text>
      <View style={styles.tags}>
        {recipe.tags.map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.section}>
        {t('recipeDetail.ingredients')}
      </Text>
      {recipe.ingredients.map((ingredient) => {
        const match = ingredientAvailability(ingredient.name, fridgeItems, synonyms);
        return (
          <List.Item
            key={`${ingredient.name}-${ingredient.amount}`}
            title={`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
            description={
              match
                ? `✓ ${t('recipeDetail.inFridge')}: ${match.name}`
                : `✗ ${t('recipeDetail.missing')}`
            }
            left={(props) => (
              <List.Icon
                {...props}
                icon={match ? 'check-circle-outline' : 'close-circle-outline'}
                color={match ? '#1B7F5D' : '#B00020'}
              />
            )}
          />
        );
      })}

      <Text variant="titleMedium" style={styles.section}>
        {t('recipeDetail.steps')}
      </Text>
      {recipe.steps.map((step, index) => (
        <Text key={step} style={styles.step}>
          {index + 1}. {step}
        </Text>
      ))}

      <Button
        mode="contained"
        onPress={handleCooked}
        loading={consume.isPending}
        disabled={deductions.length === 0}
        style={styles.button}>
        {t('recipeDetail.cooked')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, backgroundColor: '#F7FAF8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  meta: { opacity: 0.7 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  section: { marginTop: 12, marginBottom: 4 },
  step: { marginBottom: 8, lineHeight: 22 },
  button: { marginTop: 16, marginBottom: 24 },
});
