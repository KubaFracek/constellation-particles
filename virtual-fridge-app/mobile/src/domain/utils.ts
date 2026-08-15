export function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(name: string): string[] {
  const normalized = normalizeIngredient(name);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
}

export function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatExpiryLabel(expiresAt: number | null): string | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  return date.toLocaleDateString('pl-PL');
}

export function daysUntil(expiresAt: number | null, now = Date.now()): number | null {
  if (!expiresAt) return null;
  return Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
}
