import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';

import type { CategorizedMatch } from '@/src/domain/models';
import { useFridgeItems } from '@/src/hooks/useFridge';
import { useRecipeMatches } from '@/src/hooks/useRecipes';

function RecipeCard({ match }: { match: CategorizedMatch }) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card} onPress={() => router.push(`/recipe/${match.recipeId}`)}>
      <Card.Title
        title={match.title}
        subtitle={`${Math.round(match.coverage * 100)}% ${t('recipes.coverage')} • ${match.timeMinutes} ${t('recipes.minutes')}`}
      />
      <Card.Content>
        {match.missingCount > 0 ? (
          <Text variant="bodySmall">
            {t('recipes.missing')}: {match.missingIngredients.join(', ')}
          </Text>
        ) : (
          <Text variant="bodySmall" style={styles.readyText}>
            ✓ {t('recipes.ready')}
          </Text>
        )}
        <View style={styles.tags}>
          {match.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} compact style={styles.chip}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: CategorizedMatch[];
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {title}
      </Text>
      {items.map((match) => (
        <RecipeCard key={match.recipeId} match={match} />
      ))}
    </View>
  );
}

export default function RecipesScreen() {
  const { t } = useTranslation();
  const { data: fridgeItems = [] } = useFridgeItems();
  const { data: matches = [], isLoading } = useRecipeMatches();
  const [showOther, setShowOther] = useState(false);

  const grouped = useMemo(() => {
    return {
      ready: matches.filter((match) => match.category === 'ready'),
      almost: matches.filter((match) => match.category === 'almost'),
      other: matches.filter((match) => match.category === 'other'),
    };
  }, [matches]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (fridgeItems.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="titleLarge">{t('recipes.emptyTitle')}</Text>
        <Text style={styles.subtitle}>{t('recipes.emptyText')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Section title={t('recipes.ready')} items={grouped.ready} />
      <Section title={t('recipes.almost')} items={grouped.almost} />
      {grouped.other.length > 0 ? (
        <View style={styles.section}>
          <Button mode="text" onPress={() => setShowOther((value) => !value)}>
            {showOther ? t('recipes.hideOther') : t('recipes.showOther')}
          </Button>
          {showOther ? <Section title={t('recipes.other')} items={grouped.other} /> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, backgroundColor: '#F7FAF8' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#F7FAF8',
  },
  subtitle: { opacity: 0.7, textAlign: 'center' },
  section: { gap: 8, marginBottom: 16 },
  sectionTitle: { marginBottom: 4 },
  card: { marginBottom: 8 },
  readyText: { color: '#1B7F5D' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  chip: { marginRight: 4 },
});
