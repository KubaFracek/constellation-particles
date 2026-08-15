# Instalacja na telefonie BEZ komputera

## Krok 1 — na expo.dev (telefon)

1. Kliknij **Connect GitHub**
2. Zaloguj się na GitHub i zezwól Expo na dostęp
3. Wybierz repozytorium: **`constellation-particles`**
4. Gdy zapyta o folder projektu, wpisz: **`virtual-fridge-app/mobile`**

## Krok 2 — token Expo (telefon, 2 min)

1. W expo.dev otwórz menu (☰) → **Account Settings**
2. **Access tokens** → **Create token**
3. Skopiuj token (pokazuje się raz)

## Krok 3 — token w GitHub (telefon)

1. Otwórz GitHub → repo **constellation-particles**
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: wklej token z kroku 2

## Krok 4 — uruchom build w chmurze

1. GitHub → repo → zakładka **Actions**
2. Wybierz workflow **Build Android APK (EAS)**
3. **Run workflow** → **Run workflow**
4. Poczekaj ~10–20 min (możesz zamknąć przeglądarkę)

## Krok 5 — pobierz APK na telefon

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
