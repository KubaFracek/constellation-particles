# Wirtualna Lodówka — aplikacja mobilna

Aplikacja Expo (React Native) do skanowania produktów, zarządzania wirtualną lodówką i dopasowywania przepisów.

## Uruchomienie na telefonie

### Krok 1 — pobierz **Expo Go** (tylko do testów / developmentu)

To **nie jest** Twoja aplikacja z lodówką — to „odtwarzacz”, który ładuje projekt z komputera:

| Platforma | Sklep |
|-----------|-------|
| **Android** | [Google Play — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| **iPhone** | [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779) |

### Krok 2 — uruchom serwer dev na komputerze

```bash
cd virtual-fridge-app/mobile
npm install
npm start
```

W terminalu pojawi się **kod QR**.

### Krok 3 — połącz telefon

1. Telefon i komputer muszą być w **tej samej sieci Wi‑Fi**.
2. Otwórz **Expo Go** na telefonie.
3. Zeskanuj QR z terminala (Android: w Expo Go; iPhone: aparat → otwórz link w Expo Go).

Gotowe — aplikacja Wirtualna Lodówka działa na telefonie.

### Skanowanie kodów kreskowych

- **Fizyczny telefon** — kamera działa od razu w Expo Go.
- **Emulator** — kamera zwykle niedostępna; dodawaj produkty ręcznie lub wpisz kod EAN.

---

## Wersja „na stałe” (bez Expo Go)

Gdy skończysz rozwój i chcesz **własną ikonę** w sklepie (bez Expo Go):

```bash
npm install -g eas-cli
eas login
eas build --platform android   # plik APK/AAB
eas build --platform ios       # wymaga konta Apple Developer
```

To buduje **samodzielną aplikację** — instalujesz ją jak każdą inną ze sklepu lub pliku APK.

---

## Funkcje MVP

- Skan EAN-13 / UPC (`expo-camera`)
- Auto-lookup produktu w **Open Food Facts** + cache offline (SQLite)
- Ręczne dodawanie / edycja produktów w lodówce
- 32 polskie przepisy (seed JSON)
- Silnik dopasowania: **Gotowe** / **Prawie** / reszta
- Odejmowanie składników po ugotowaniu

## Struktura

```
mobile/
  app/              # ekrany (Expo Router)
  src/
    domain/         # RecipeMatcher, modele
    data/           # SQLite, API, repozytoria
    hooks/          # React Query hooks
    i18n/           # tłumaczenia PL
  assets/recipes/   # pl.json — baza przepisów
```

## Komendy

| Komenda | Opis |
|---------|------|
| `npm start` | Serwer Expo + QR do telefonu |
| `npm run android` | Emulator Android |
| `npm run ios` | Simulator iOS (tylko macOS) |
| `npm test` | Testy matchera przepisów |

## Stack

Expo SDK 57 · TypeScript · SQLite · React Native Paper · TanStack Query · Zod

## Dokumentacja projektu

Pełna specyfikacja: [`docs/ADVANCED_PROMPT.md`](../docs/ADVANCED_PROMPT.md)
