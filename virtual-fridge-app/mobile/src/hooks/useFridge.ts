import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NewFridgeItemInput } from '../domain/models';
import {
  addFridgeItem,
  consumeIngredients,
  deleteFridgeItem,
  listFridgeItems,
  updateFridgeItem,
} from '../data/repositories/FridgeRepository';
import { useDatabase } from '../providers/DatabaseContext';

export function useFridgeItems() {
  const db = useDatabase();

  return useQuery({
    queryKey: ['fridge-items'],
    queryFn: () => listFridgeItems(db),
  });
}

export function useFridgeMutations() {
  const db = useDatabase();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['fridge-items'] });

  const addItem = useMutation({
    mutationFn: (input: NewFridgeItemInput) => addFridgeItem(db, input),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => deleteFridgeItem(db, id),
    onSuccess: invalidate,
  });

  const editItem = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateFridgeItem>[2];
    }) => updateFridgeItem(db, id, patch),
    onSuccess: invalidate,
  });

  const consume = useMutation({
    mutationFn: (deductions: Array<{ fridgeItemId: string; amount: number }>) =>
      consumeIngredients(db, deductions),
    onSuccess: invalidate,
  });

  return { addItem, removeItem, editItem, consume };
}
