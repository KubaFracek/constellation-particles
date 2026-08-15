import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, IconButton, List, Text } from 'react-native-paper';

import { daysUntil, formatExpiryLabel } from '@/src/domain/utils';
import { useFridgeItems, useFridgeMutations } from '@/src/hooks/useFridge';

export default function FridgeScreen() {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useFridgeItems();
  const { removeItem } = useFridgeMutations();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="fridge-off-outline" size={64} color="#1B7F5D" />
          <Text variant="titleLarge">{t('fridge.emptyTitle')}</Text>
          <Text style={styles.subtitle}>{t('fridge.emptyText')}</Text>
          <FAB
            icon="plus"
            label={t('fridge.addManual')}
            style={styles.emptyFab}
            onPress={() => router.push('/add-product')}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const expiryDays = daysUntil(item.expiresAt);
            const expiryLabel = formatExpiryLabel(item.expiresAt);
            const expiringSoon = expiryDays !== null && expiryDays <= 3;

            return (
              <List.Item
                title={item.name}
                description={`${t('fridge.quantity')}: ${item.quantity} ${item.unit}${
                  expiryLabel ? ` • ${t('fridge.expires')}: ${expiryLabel}` : ''
                }${expiringSoon ? ` • ${t('fridge.expiringSoon')}` : ''}`}
                left={(props) => <List.Icon {...props} icon="food-apple-outline" />}
                right={() => (
                  <IconButton
                    icon="delete-outline"
                    onPress={() => removeItem.mutate(item.id)}
                  />
                )}
                onPress={() =>
                  router.push({
                    pathname: '/add-product',
                    params: {
                      id: item.id,
                      name: item.name,
                      barcode: item.barcode ?? '',
                      quantity: String(item.quantity),
                      unit: item.unit,
                      category: item.category ?? '',
                      expiry: item.expiresAt
                        ? new Date(item.expiresAt).toISOString().slice(0, 10)
                        : '',
                      source: item.source,
                    },
                  })
                }
              />
            );
          }}
        />
      )}

      {items.length > 0 ? (
        <FAB icon="plus" style={styles.fab} onPress={() => router.push('/add-product')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF8' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  subtitle: { opacity: 0.7, textAlign: 'center' },
  list: { paddingBottom: 96 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  emptyFab: { marginTop: 16 },
});
