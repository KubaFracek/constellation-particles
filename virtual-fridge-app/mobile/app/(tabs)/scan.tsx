import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function ScanScreen() {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  const handleBarcode = useCallback(
    async ({ data }: { data: string }) => {
      const now = Date.now();
      const last = lastScanRef.current;
      if (last && last.code === data && now - last.at < 2000) {
        return;
      }

      lastScanRef.current = { code: data, at: now };
      setScanned(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.push({
        pathname: '/add-product',
        params: { barcode: data, source: 'scan' },
      });
    },
    [],
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text variant="titleLarge" style={styles.title}>
          {t('scan.permissionTitle')}
        </Text>
        <Text style={styles.subtitle}>{t('scan.permissionText')}</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.button}>
          {t('scan.grantPermission')}
        </Button>
        <Button mode="outlined" onPress={() => router.push('/add-product')} style={styles.button}>
          {t('scan.manualEntry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text variant="titleMedium" style={styles.hint}>
          {t('scan.scanningHint')}
        </Text>
        <Button
          mode="contained-tonal"
          onPress={() => {
            setScanned(false);
            router.push('/add-product');
          }}>
          {t('scan.manualEntry')}
        </Button>
        {scanned ? (
          <Button mode="contained" onPress={() => setScanned(false)} style={styles.button}>
            {t('scan.lastScanned')}
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#F7FAF8',
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', opacity: 0.7 },
  button: { marginTop: 8 },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 24,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  frame: {
    position: 'absolute',
    top: '25%',
    width: '70%',
    height: 120,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  hint: { color: '#fff', textAlign: 'center' },
});
