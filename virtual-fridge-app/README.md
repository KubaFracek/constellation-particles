# Wirtualna Lodówka — projekt aplikacji mobilnej

Aplikacja mobilna do skanowania kodów kreskowych produktów, zarządzania wirtualną lodówką i dopasowywania przepisów na podstawie dostępnych składników.

## Zawartość folderu

| Plik / folder | Opis |
|---------------|------|
| [`mobile/`](mobile/) | **Aplikacja Expo** — kod, uruchomienie, testy |
| [`mobile/README.md`](mobile/README.md) | Instrukcja uruchomienia na telefonie (Expo Go) |
| [`docs/ADVANCED_PROMPT.md`](docs/ADVANCED_PROMPT.md) | Pełna specyfikacja techniczna + prompt AI |

## Szybki start na telefonie

1. Zainstaluj **Expo Go** na Androidzie lub iPhone ([instrukcja w mobile/README.md](mobile/README.md)).
2. Na komputerze:
   ```bash
   cd virtual-fridge-app/mobile
   npm install
   npm start
   ```
3. Zeskanuj QR w Expo Go — aplikacja działa na telefonie.

> **Expo Go** służy do testów. Docelowa wersja w sklepie Play/App Store budowana jest przez **EAS Build** (opis w `mobile/README.md`).

## Status

- [x] Specyfikacja i prompt
- [x] MVP aplikacji (skan + lodówka + przepisy)
- [ ] Publikacja w sklepach (EAS Build)
