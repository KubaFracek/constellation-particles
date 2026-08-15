# Instalacja na telefonie BEZ komputera

## Krok 1 — na expo.dev (telefon)

1. Kliknij **Connect GitHub**
2. Zaloguj się na GitHub i zezwól Expo na dostęp
3. Wybierz repozytorium: **`constellation-particles`**
4. Gdy zapyta o folder projektu, wpisz: **`virtual-fridge-app/mobile`**

## Krok 2 — dwa secrety (telefon, 3 min)

### A) Token Expo
1. expo.dev → menu ☰ → **Account Settings**
2. **Access tokens** → **Create token**
3. GitHub → repo → **Settings** → **Secrets and variables** → **Actions**
4. **New repository secret** → Name: `EXPO_TOKEN`, Value: token

### B) Project ID (WAŻNE — bez tego build pada)
1. expo.dev → projekt **Lodówka** → **Details** (lub Settings → General)
2. Skopiuj **Project ID** (UUID, np. `a1b2c3d4-e5f6-...`)
3. GitHub → **Secrets** → **New repository secret**
   - Name: `EXPO_PROJECT_ID`
   - Value: wklej Project ID

## Krok 3 — uruchom build w chmurze

1. GitHub → repo → zakładka **Actions**
2. Wybierz workflow **Build Android APK (EAS)**
3. **Run workflow** → **Run workflow**
4. Poczekaj ~10–20 min (możesz zamknąć przeglądarkę)

## Krok 4 — pobierz APK na telefon

1. Wróć na **expo.dev** → projekt **Lodówka**
2. Zakładka **Builds** (w menu projektu)
3. Gdy build ma status **Finished**, kliknij go → **Download** / **Install**
4. Android poprosi o zezwolenie na instalację z „nieznanego źródła” — zezwól

Gotowe — masz własną apkę, **bez Expo Go** i **bez komputera**.

---

## Czego NIE klikać na start

- **Get started with development builds** — to wersja dla programistów, nie potrzebujesz tego na początek
- **Expo Go** — nie zadziała bez komputera z `npm start`

## iPhone

Bez płatnego konta Apple Developer nie da się łatwo zainstalować własnej apki. Na iPhone sensowna opcja to później TestFlight.
