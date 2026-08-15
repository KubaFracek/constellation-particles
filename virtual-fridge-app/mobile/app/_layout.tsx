import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/src/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-product"
          options={{ presentation: 'modal', title: 'Dodaj produkt' }}
        />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Przepis' }} />
      </Stack>
    </AppProviders>
  );
}
