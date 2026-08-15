# Turbo zaawansowany prompt — aplikacja mobilna „Wirtualna Lodówka + Przepisy”

> **Cel dokumentu:** gotowy prompt do pracy z AI (Cursor, Claude, ChatGPT) lub zespołem dev — opisuje produkt, architekturę, stack, API, algorytmy i kryteria jakości. Wklej sekcję „Prompt do wklejenia” na końcu pliku do agenta kodującego.

---

## 1. Opis produktu (Product Brief)

Zbuduj **natywną aplikację mobilną** (iOS + Android), która:

1. **Skanuje kody kreskowe** (EAN-13, UPC, Code128) produktów spożywczych.
2. **Dodaje produkty do wirtualnej lodówki** — ręcznie (tekst) lub po skanowaniu (auto-uzupełnienie z bazy).
3. **Śledzi ilość i daty ważności** (opcjonalnie: jednostki, kategorie, lokalizacja w lodówce).
4. **Dopasowuje przepisy** do aktualnych składników — pokazuje co można ugotować **teraz**, co **prawie** (brakuje 1–2 składników), i co **wygasa wkrótce** (priorytet anti-waste).
5. Działa **offline-first** (lodówka zawsze dostępna), synchronizacja w chmurze opcjonalna w v2.

**Persona:** użytkownik domowy, szybkie skanowanie po zakupach, minimalna liczba tapnięć.

**Kluczowe metryki sukcesu:**
- Skan → produkt w lodówce: **< 3 s** (online), **< 1 s** (offline cache).
- Dopasowanie przepisów dla 30 składników: **< 500 ms** na urządzeniu.
- Zero utraty danych przy braku sieci.

---

## 2. Rekomendowany stack technologiczny

### 2.1 Framework mobilny — **Expo (React Native) + TypeScript** *(rekomendacja #1)*

| Warstwa | Narzędzie | Dlaczego |
|--------|-----------|----------|
| Framework | **Expo SDK 52+** | Szybki dev, OTA updates, prosty build (EAS) |
| Język | **TypeScript (strict)** | Bezpieczeństwo typów, lepsze refaktory |
| Nawigacja | **Expo Router (file-based)** | Deep linki, typowane trasy |
| UI | **React Native Paper** lub **Tamagui** | Material Design, dostępność |
| Stan globalny | **Zustand** + **TanStack Query** | Prosty store + cache API |
| Baza lokalna | **Expo SQLite** + **Drizzle ORM** | Relacje, migracje, type-safe queries |
| Skaner kodów | **expo-camera** + **Vision Camera** + plugin barcode | Wydajność, ML Kit na Androidzie |
| Formularze | **React Hook Form** + **Zod** | Walidacja schematów |
| i18n | **expo-localization** + **i18next** | PL + EN |
| Testy | **Jest** + **Maestro** (E2E) | Unit + flow skanowania |
| CI/CD | **GitHub Actions** + **EAS Build/Submit** | Automatyczne buildy |

**Alternatywa:** Flutter + `mobile_scanner` + `drift` — lepsza spójność UI, wolniejszy ekosystem npm.

### 2.2 Backend (v1 minimalny, v2 rozszerzony)

**v1 — bez własnego backendu:**
- Produkty: **Open Food Facts API** (darmowe, EAN).
- Przepisy: lokalna baza seed + **TheMealDB API** (darmowe) lub import JSON.

**v2 — opcjonalny backend:**
- **Supabase** (Postgres + Auth + Realtime + Storage) *lub* **Firebase**
- Edge Functions do: normalizacji składników, cache OFF, własne przepisy użytkownika

---

## 3. Architektura aplikacji

```
┌─────────────────────────────────────────────────────────────┐
│                      UI (Expo Router screens)                │
│  ScanScreen │ FridgeScreen │ RecipeList │ RecipeDetail      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   ViewModels / Hooks layer                     │
│  useBarcodeScanner │ useFridge │ useRecipeMatcher             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Domain (pure TypeScript)                   │
│  Product, FridgeItem, Recipe, IngredientMatcher               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────┬───────────┴───────────┬──────────────────────┐
│ SQLite Repo  │ OpenFoodFacts Client  │ Recipe Repository     │
│ (offline)    │ (online + cache)      │ (local + API)         │
└──────────────┴───────────────────────┴──────────────────────┘
```

**Wzorzec:** Clean Architecture lite — domain nie zna Reacta ani SQLite.

**Foldery (feature-first):**
```
src/
  features/
    scan/
    fridge/
    recipes/
  domain/
    models/
    services/
  data/
    db/
    api/
    repositories/
  shared/
    ui/
    utils/
```

---

## 4. Model danych (SQLite + Drizzle)

### Tabela `fridge_items`
| Kolumna | Typ | Opis |
|---------|-----|------|
| id | UUID | PK |
| name | TEXT | Nazwa wyświetlana |
| barcode | TEXT? | EAN |
| quantity | REAL | Ilość |
| unit | TEXT | g, ml, szt, opak. |
| category | TEXT | nabiał, warzywa… |
| expires_at | INTEGER? | Unix timestamp |
| added_at | INTEGER | |
| source | TEXT | scan \| manual \| import |
| off_product_id | TEXT? | ID z Open Food Facts |

### Tabela `products_cache`
Cache odpowiedzi OFF po barcode — klucz offline.

### Tabela `recipes` + `recipe_ingredients`
Przepisy z listą składników; każdy składnik ma `canonical_name` (znormalizowana nazwa do matchowania).

### Tabela `ingredient_synonyms`
Mapowanie: „pomidor” ↔ „pomidory” ↔ „tomato” ↔ tag OFF.

---

## 5. Skanowanie kodów kreskowych — metody i narzędzia

### Implementacja (Expo)

```typescript
// Pseudokod — Vision Camera + code scanner
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const codeScanner = useCodeScanner({
  codeTypes: ['ean-13', 'ean-8', 'upc-a', 'code-128'],
  onCodeScanned: (codes) => {
    const barcode = codes[0]?.value;
    if (barcode) onBarcodeDetected(barcode);
  },
});
```

**Biblioteki:**
- `react-native-vision-camera` — wydajny preview + skanowanie
- `expo-camera` — prostsza alternatywa w czystym Expo
- **Google ML Kit Barcode Scanning** (Android) / **AVFoundation** (iOS) — pod spodem

**UX skanera:**
1. Pełnoekranowy podgląd kamery + celownik.
2. Wibracja + dźwięk po udanym skanie (haptic: `expo-haptics`).
3. Debounce 2 s na ten sam kod (unikaj duplikatów).
4. Fallback: **ręczne wpisanie EAN** + wyszukiwarka tekstowa produktu.
5. Latarka (`torch`) w słabym świetle.
6. Uprawnienia: `Camera.requestCameraPermissionsAsync()` z jasnym onboardingiem.

**Obsługa błędów:**
- Kod nie w OFF → formularz „Dodaj ręcznie” z prefill barcode.
- Brak sieci → sprawdź `products_cache`, potem manual entry.

---

## 6. API produktów — Open Food Facts

**Endpoint:** `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`

**Pola do mapowania:**
- `product_name` → name
- `categories_tags` → category
- `quantity` → hint ilości
- `ingredients_text` → opcjonalna informacja
- `image_front_small_url` → miniatura w lodówce

**Klient HTTP:** `fetch` + TanStack Query z `staleTime: 7 dni` dla produktów.

**Rate limiting:** max 10 req/s (OFF policy) — kolejka + exponential backoff.

**Normalizacja nazw (NLP lite):**
```typescript
function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // usuń diakrytyki
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
```

---

## 7. Silnik dopasowania przepisów (Recipe Matcher)

To **serce aplikacji** — nie używaj prostego `includes()` na surowych stringach.

### 7.1 Algorytm (3 poziomy dopasowania)

Dla każdego przepisu oblicz:

| Metryka | Wzór | Próg |
|---------|------|------|
| **coverage** | `matched_required / total_required` | 100% = „Możesz ugotować” |
| **missing_count** | lista brakujących składników | 0 = pełne dopasowanie |
| **expiry_boost** | bonus jeśli przepis wykorzystuje składniki z `expires_at < now+3d` | sortowanie |
| **optional_ingredients** | nie liczą się do coverage | |

**Kategorie wyników:**
- 🟢 **Gotowe do ugotowania** — coverage = 100%
- 🟡 **Prawie** — brakuje ≤ 2 składników OR coverage ≥ 80%
- 🔴 **Brakuje dużo** — reszta (ukryte domyślnie lub na końcu listy)

### 7.2 Dopasowanie składnik ↔ produkt w lodówce

1. **Exact match** na `canonical_name`
2. **Synonym table** lookup
3. **Token overlap** (Jaccard similarity > 0.6) — fallback
4. **Kategorie** (np. „mleko” matchuje „mleko 3.2% Mlekovita”) — reguły domenowe

```typescript
type MatchResult = {
  recipeId: string;
  coverage: number;
  missingIngredients: string[];
  usedFridgeItemIds: string[];
  expiryScore: number;
};

function rankRecipes(
  recipes: Recipe[],
  fridgeItems: FridgeItem[],
  synonyms: Map<string, string[]>
): MatchResult[] {
  // implementacja O(recipes × ingredients × fridgeItems)
  // optymalizacja: indeks HashMap canonical_name → FridgeItem[]
}
```

### 7.3 Źródła przepisów

| Źródło | Metoda | Uwagi |
|--------|--------|-------|
| **Seed JSON** | Bundled w aplikacji (~200 przepisów PL) | Offline guaranteed |
| **TheMealDB** | REST API, darmowy klucz | EN — wymaga tłumaczenia/mapowania |
| **Spoonacular API** | Płatny, bogaty | v2 — jeśli potrzeba jakości |
| **Własne przepisy użytkownika** | Formularz CRUD | v2 |

**Rekomendacja v1:** bundled JSON PL + parser importu z prostym formatem:

```json
{
  "id": "pl-001",
  "title": "Jajecznica z pomidorami",
  "ingredients": [
    { "name": "jajko", "amount": 3, "unit": "szt", "required": true },
    { "name": "pomidor", "amount": 2, "unit": "szt", "required": true },
    { "name": "masło", "amount": 20, "unit": "g", "required": false }
  ],
  "steps": ["...", "..."],
  "time_minutes": 10,
  "tags": ["śniadanie", "szybkie"]
}
```

---

## 8. Ekrany i user flow

### 8.1 Onboarding (1×)
- Pozwolenie na kamerę
- Krótki tutorial: skan → lodówka → przepisy

### 8.2 Tab navigation
1. **Skanuj** — kamera + ostatnio skanowane
2. **Lodówka** — lista/grupy, swipe to delete, edit quantity/expiry
3. **Przepisy** — filtry: Gotowe / Prawie / Wygasa / Ulubione
4. **Ustawienia** — język, jednostki, eksport danych

### 8.3 Flow: skanowanie
```
Otwórz kamerę → wykryj EAN → [online] pobierz OFF → pokaż kartę produktu
  → użytkownik potwierdza ilość + data ważności → zapis SQLite → toast sukcesu
```

### 8.4 Flow: dodawanie ręczne
```
FAB „+” → formularz (nazwa*, ilość, jednostka, data) → zapis
Autocomplete z historii + popularnych produktów
```

### 8.5 Flow: przepis
```
Lista posortowana (coverage DESC, expiry_boost DESC)
  → tap → szczegóły: składniki (✓ w lodówce / ✗ brakuje) + kroki
  → CTA „Odejmij składniki z lodówki” po ugotowaniu
```

---

## 9. Narzędzia developerskie i workflow

### 9.1 Środowisko
```bash
npx create-expo-app@latest virtual-fridge --template tabs
cd virtual-fridge
npx expo install expo-sqlite drizzle-orm
npm i @tanstack/react-query zustand zod react-hook-form
npx expo install react-native-vision-camera expo-haptics
```

### 9.2 Cursor / AI — jak pisać kod z tym promptem
- **Composer Agent** — implementacja feature po feature (`scan`, potem `fridge`, potem `recipes`).
- **Rules (.cursor/rules):** „TypeScript strict, feature-first, testy dla matchera”.
- **@Docs:** Expo, Drizzle, Vision Camera documentation.
- Każdy PR = jeden feature + testy.

### 9.3 Jakość kodu
- **ESLint** + **Prettier** + **Husky pre-commit**
- **TypeScript strict: true**
- **Conventional Commits**

### 9.4 Testy priorytetowe
1. `IngredientMatcher` — unit (30+ cases PL synonyms)
2. `RecipeRepository` — integration z SQLite in-memory
3. Maestro E2E: „dodaj jajka ręcznie → zobacz jajecznicę na liście”

---

## 10. Bezpieczeństwo i prywatność

- Dane lodówki **lokalne** — bez wysyłki na serwer w v1.
- API keys (jeśli Spoonacular) w **Expo Secrets / EAS env**, nie w repo.
- Walidacja barcode: tylko cyfry, checksum EAN-13.
- Sanityzacja inputu tekstowego (XSS nie dotyczy RN, ale SQL injection — używaj parameterized queries przez Drizzle).

---

## 11. Roadmapa wersji

| Wersja | Scope |
|--------|-------|
| **MVP (v0.1)** | Skan EAN, ręczne dodawanie, lodówka SQLite, 50 przepisów seed, matcher |
| **v0.2** | Daty ważności, filtr anti-waste, synonym table |
| **v0.3** | OFF cache offline, latarka, haptic |
| **v1.0** | EAS release App Store + Google Play |
| **v2.0** | Konto użytkownika, sync, własne przepisy, lista zakupów z brakujących składników |

---

## 12. Kryteria akceptacji (Definition of Done)

- [ ] Skan EAN-13 działa na iOS Simulator (mock) i fizycznym Androidzie
- [ ] Produkt z OFF lub ręczny trafia do SQLite i jest widoczny po restarcie app
- [ ] Matcher zwraca poprawne „Gotowe” / „Prawie” dla znanych scenariuszy testowych
- [ ] Aplikacja działa w trybie airplane (lodówka + seed recipes)
- [ ] Czas cold start < 2 s na mid-range Android
- [ ] WCAG: min. 44pt touch targets, czytelny kontrast

---

## 13. PROMPT DO WKLEJENIA (dla agenta AI / Cursor Composer)

Skopiuj poniższy blok i wklej jako instrukcję główną:

---

```
Jesteś senior mobile developerem. Zbuduj aplikację „Wirtualna Lodówka” w Expo (React Native) + TypeScript.

WYMAGANIA FUNKCJONALNE:
1. Ekran skanera kodów kreskowych (EAN-13/UPC) używając react-native-vision-camera + useCodeScanner.
2. Po skanowaniu pobierz produkt z Open Food Facts API (v2). Przy braku sieci użyj lokalnego cache SQLite. Przy braku produktu pokaż formularz ręcznego dodawania z wpisanym barcode.
3. Ekran lodówki: lista produktów z ilością, jednostką, opcjonalną datą ważności. CRUD + swipe delete. Dodawanie ręczne przez FAB z walidacją Zod.
4. Ekran przepisów: silnik dopasowania składników do zawartości lodówki. Trzy kategorie: „Gotowe” (100% required), „Prawie” (brakuje max 2), reszta ukryta domyślnie. Sortuj po coverage i priorytecie składników wygasających w 3 dni.
5. Szczegóły przepisu: lista składników z oznaczeniem ✓/✗ względem lodówki, kroki, czas. Przycisk „Ugotowane” odejmuje ilości z lodówki.

ARCHITEKTURA:
- Expo Router (file-based routing), feature-first folders
- SQLite przez expo-sqlite + Drizzle ORM z migracjami
- Zustand (stan UI) + TanStack Query (API cache)
- Clean Architecture: domain/ (pure TS), data/ (repos), features/ (UI)
- React Hook Form + Zod dla formularzy

MODEL DANYCH:
- fridge_items(id, name, barcode?, quantity, unit, category?, expires_at?, added_at, source, off_product_id?)
- products_cache(barcode PK, json, fetched_at)
- recipes(id, title, steps_json, time_minutes, tags)
- recipe_ingredients(recipe_id, name, amount, unit, required)
- ingredient_synonyms(canonical, variant)

MATCHER (domain/services/RecipeMatcher.ts):
- normalizeIngredient(): lowercase, strip diacritics, alphanumeric
- match przez exact canonical → synonyms → Jaccard token overlap > 0.6
- zwracaj MatchResult[] posortowane

SEED DATA:
- Dołącz min. 30 polskich przepisów w assets/recipes/pl.json

UI/UX:
- Bottom tabs: Skanuj | Lodówka | Przepisy | Ustawienia
- React Native Paper, obsługa PL przez i18next
- Haptic feedback po skanie, debounce duplikatów 2s
- Empty states z ilustracjami i CTA

TESTY:
- Jest unit tests dla RecipeMatcher (min. 15 przypadków)
- Drizzle schema + migracja v1

NIE RÓB:
- Własnego backendu w MVP
- Spaghetti code — każdy feature w osobnym folderze
- Hardcoded stringów — używaj i18n

ZACZNIJ OD:
1. Scaffolding projektu + Drizzle schema + migracje
2. Fridge CRUD (manual add) — żeby mieć dane testowe
3. RecipeMatcher + seed JSON + ekran przepisów
4. Barcode scanner + Open Food Facts integration
5. Polish UX + testy

Po każdym kroku uruchom aplikację i upewnij się, że działa na Expo Go / dev build.
```

---

## 14. Przydatne linki

- Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Vision Camera: https://react-native-vision-camera.com/docs/guides/code-scanning
- Drizzle ORM: https://orm.drizzle.team/docs/get-started-sqlite
- TheMealDB: https://www.themealdb.com/api.php
- Maestro E2E: https://maestro.mobile.dev/

---

*Dokument wygenerowany jako specyfikacja projektu Wirtualna Lodówka. Folder projektu: `virtual-fridge-app/`.*
