import { useQuery } from '@tanstack/react-query';

import { fetchProductByBarcode } from '../data/api/openFoodFacts';
import { lookupProduct } from '../data/repositories/ProductCacheRepository';
import { useDatabase } from '../providers/DatabaseContext';

export function useProductLookup(barcode: string | null, enabled = true) {
  const db = useDatabase();

  return useQuery({
    queryKey: ['product', barcode],
    queryFn: () => lookupProduct(db, barcode!, fetchProductByBarcode),
    enabled: Boolean(barcode) && enabled,
  });
}
