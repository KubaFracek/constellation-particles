import type { OffProduct } from '../../domain/models';

interface OffApiResponse {
  status: number;
  product?: {
    code?: string;
    product_name?: string;
    product_name_pl?: string;
    categories?: string;
    quantity?: string;
    image_front_small_url?: string;
    _id?: string;
  };
}

export async function fetchProductByBarcode(barcode: string): Promise<OffProduct | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
    {
      headers: {
        'User-Agent': 'WirtualnaLodowka/1.0 (contact@example.com)',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Open Food Facts error: ${response.status}`);
  }

  const data = (await response.json()) as OffApiResponse;
  if (data.status !== 1 || !data.product) {
    return null;
  }

  const product = data.product;
  const name = product.product_name_pl?.trim() || product.product_name?.trim();
  if (!name) return null;

  return {
    barcode,
    name,
    category: product.categories?.split(',')[0]?.trim() ?? null,
    imageUrl: product.image_front_small_url ?? null,
    offProductId: product._id ?? barcode,
    quantityHint: product.quantity ?? null,
  };
}

export function isValidEan13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  const digits = barcode.split('').map(Number);
  const checksum = digits.slice(0, 12).reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const expected = (10 - (checksum % 10)) % 10;
  return expected === digits[12];
}
