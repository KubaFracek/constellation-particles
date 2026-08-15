# Wirtualna Lodówka — projekt aplikacji mobilnej

Aplikacja mobilna do skanowania kodów kreskowych produktów, zarządzania wirtualną lodówką i dopasowywania przepisów na podstawie dostępnych składników.

## Zawartość folderu

| Plik / folder | Opis |
|---------------|------|
| [`docs/ADVANCED_PROMPT.md`](docs/ADVANCED_PROMPT.md) | Turbo zaawansowany prompt + pełna specyfikacja techniczna |
| `app/` | *(wkrótce)* kod aplikacji Expo |
| `assets/` | *(wkrótce)* seed przepisów, grafiki |

## Szybki start

1. Przeczytaj [`docs/ADVANCED_PROMPT.md`](docs/ADVANCED_PROMPT.md) — sekcja **13. PROMPT DO WKLEJENIA**.
2. Wklej prompt do Cursor Composer / agenta AI, aby rozpocząć implementację.
3. Wszystkie kolejne prace nad tym projektem trzymaj w tym folderze.

## Rekomendowany stack

- **Expo (React Native) + TypeScript**
- **SQLite + Drizzle ORM** (offline-first)
- **Open Food Facts API** (produkty po kodzie EAN)
- **react-native-vision-camera** (skanowanie kodów)
- Własny **Recipe Matcher** (dopasowanie składników)

## Status

- [x] Specyfikacja i prompt
- [ ] Scaffolding aplikacji
- [ ] MVP (skan + lodówka + przepisy)
