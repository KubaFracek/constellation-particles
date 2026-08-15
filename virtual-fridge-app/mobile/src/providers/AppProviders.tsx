import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import type { SQLiteDatabase } from 'expo-sqlite';

import { initializeDatabase } from '../data/db';
import { seedDatabaseIfNeeded } from '../data/repositories/RecipeRepository';
import '../i18n';

import { DatabaseContext } from './DatabaseContext';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const database = await initializeDatabase();
        await seedDatabaseIfNeeded(database);
        if (mounted) setDb(database);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Database error');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!db) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
