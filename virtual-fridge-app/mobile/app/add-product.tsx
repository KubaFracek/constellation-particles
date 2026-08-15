import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper';

import {
  fridgeItemSchema,
  parseExpiryDate,
  type FridgeItemFormValues,
} from '@/src/features/fridge/schema';
import { useFridgeMutations } from '@/src/hooks/useFridge';
import { useProductLookup } from '@/src/hooks/useProductLookup';

export default function AddProductScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    id?: string;
    barcode?: string;
    name?: string;
    quantity?: string;
    unit?: string;
    category?: string;
    expiry?: string;
    source?: string;
  }>();

  const isEditing = Boolean(params.id);
  const barcodeParam = params.barcode?.trim() || undefined;
  const { addItem, editItem } = useFridgeMutations();
  const { data: product, isFetching, isError } = useProductLookup(
    barcodeParam ?? null,
    !isEditing && Boolean(barcodeParam),
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FridgeItemFormValues>({
    resolver: zodResolver(fridgeItemSchema),
    defaultValues: {
      name: params.name ?? '',
      barcode: barcodeParam ?? '',
      quantity: params.quantity ? Number(params.quantity) : 1,
      unit: params.unit ?? 'szt',
      category: params.category ?? '',
      expiry: params.expiry ?? '',
    },
  });

  useEffect(() => {
    if (product && !isEditing) {
      setValue('name', product.name);
      if (product.category) setValue('category', product.category);
    }
  }, [product, isEditing, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      barcode: values.barcode || null,
      quantity: values.quantity,
      unit: values.unit,
      category: values.category || null,
      expiresAt: parseExpiryDate(values.expiry),
      source: (params.source === 'scan' ? 'scan' : 'manual') as 'scan' | 'manual',
      offProductId: product?.offProductId ?? null,
    };

    if (isEditing && params.id) {
      await editItem.mutateAsync({
        id: params.id,
        patch: {
          name: payload.name,
          quantity: payload.quantity,
          unit: payload.unit,
          category: payload.category,
          expiresAt: payload.expiresAt,
        },
      });
    } else {
      await addItem.mutateAsync(payload);
    }

    router.back();
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {barcodeParam && !isEditing ? (
        <View style={styles.lookupBox}>
          {isFetching ? (
            <>
              <ActivityIndicator />
              <Text>{t('addProduct.lookup')}</Text>
            </>
          ) : product ? (
            <Text>{t('addProduct.fromScan')}: {product.name}</Text>
          ) : isError ? (
            <Text style={styles.warning}>{t('common.error')}</Text>
          ) : (
            <Text style={styles.warning}>{t('addProduct.notFound')}</Text>
          )}
        </View>
      ) : null}

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('addProduct.name')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(errors.name)}
            style={styles.input}
          />
        )}
      />
      {errors.name ? <Text style={styles.error}>{errors.name.message}</Text> : null}

      <Controller
        control={control}
        name="barcode"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('addProduct.barcode')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            style={styles.input}
          />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('addProduct.quantity')}
              value={String(value)}
              onChangeText={(text) => onChange(Number(text.replace(',', '.')) || 0)}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={Boolean(errors.quantity)}
              style={[styles.input, styles.half]}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label={t('addProduct.unit')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={[styles.input, styles.half]}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('addProduct.category')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="expiry"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('addProduct.expiry')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="2026-12-31"
            style={styles.input}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={isSubmitting}
        style={styles.button}>
        {t('addProduct.save')}
      </Button>
      <Button mode="text" onPress={() => router.back()}>
        {t('common.cancel')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, backgroundColor: '#F7FAF8' },
  lookupBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E8F5EF',
    gap: 8,
    marginBottom: 8,
  },
  input: { backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  button: { marginTop: 8 },
  error: { color: '#B00020' },
  warning: { color: '#8A5A00' },
});
