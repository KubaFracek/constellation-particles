import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text variant="headlineSmall">🧊 Wirtualna Lodówka</Text>
        <Text style={styles.subtitle}>{t('settings.aboutText')}</Text>
      </View>

      <List.Section>
        <List.Item
          title={t('settings.offline')}
          description={t('settings.aboutText')}
          left={(props) => <List.Icon {...props} icon="cloud-off-outline" />}
        />
        <List.Item
          title={t('settings.version')}
          description={Constants.expoConfig?.version ?? '1.0.0'}
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F7FAF8', minHeight: '100%' },
  hero: { gap: 8, marginBottom: 16 },
  subtitle: { opacity: 0.75 },
});
