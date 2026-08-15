import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pl: {
    translation: {
      tabs: {
        scan: 'Skanuj',
        fridge: 'Lodówka',
        recipes: 'Przepisy',
        settings: 'Ustawienia',
      },
      scan: {
        title: 'Skanuj produkt',
        permissionTitle: 'Potrzebujemy kamery',
        permissionText: 'Aby skanować kody kreskowe produktów, zezwól na dostęp do kamery.',
        grantPermission: 'Zezwól na kamerę',
        manualEntry: 'Wpisz kod ręcznie',
        scanningHint: 'Skieruj kamerę na kod kreskowy',
        lastScanned: 'Ostatnio skanowane',
      },
      fridge: {
        title: 'Twoja lodówka',
        emptyTitle: 'Lodówka jest pusta',
        emptyText: 'Zeskanuj produkt lub dodaj go ręcznie.',
        addManual: 'Dodaj ręcznie',
        quantity: 'Ilość',
        expires: 'Ważne do',
        delete: 'Usuń',
        edit: 'Edytuj',
        noExpiry: 'Bez daty',
        expiringSoon: 'Wygasa wkrótce',
      },
      recipes: {
        title: 'Przepisy',
        ready: 'Gotowe do ugotowania',
        almost: 'Prawie — brakuje mało',
        other: 'Pozostałe',
        showOther: 'Pokaż pozostałe',
        hideOther: 'Ukryj pozostałe',
        missing: 'Brakuje',
        coverage: 'Dopasowanie',
        emptyTitle: 'Brak przepisów',
        emptyText: 'Dodaj produkty do lodówki, aby zobaczyć dopasowane przepisy.',
        minutes: 'min',
      },
      recipeDetail: {
        ingredients: 'Składniki',
        steps: 'Kroki',
        inFridge: 'Masz w lodówce',
        missing: 'Brakuje',
        cooked: 'Ugotowane — odejmij składniki',
        optional: 'opcjonalnie',
      },
      addProduct: {
        title: 'Dodaj produkt',
        name: 'Nazwa produktu',
        barcode: 'Kod kreskowy',
        quantity: 'Ilość',
        unit: 'Jednostka',
        category: 'Kategoria',
        expiry: 'Data ważności (RRRR-MM-DD)',
        save: 'Zapisz do lodówki',
        lookup: 'Szukam produktu...',
        notFound: 'Nie znaleziono w bazie — uzupełnij ręcznie',
        fromScan: 'Produkt ze skanera',
      },
      settings: {
        title: 'Ustawienia',
        about: 'O aplikacji',
        aboutText:
          'Wirtualna Lodówka pomaga śledzić produkty i gotować z tego, co masz w domu.',
        offline: 'Dane przechowywane lokalnie na telefonie.',
        version: 'Wersja',
      },
      common: {
        cancel: 'Anuluj',
        save: 'Zapisz',
        loading: 'Ładowanie...',
        error: 'Coś poszło nie tak',
        retry: 'Spróbuj ponownie',
      },
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'pl',
    fallbackLng: 'pl',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
