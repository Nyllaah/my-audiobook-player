import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import pt from './locales/pt-BR.json';

const i18n = new I18n({
  en,
  'pt-BR': pt,
});

// Set the locale once at the beginning of your app
const deviceLocale = getLocales()[0]?.languageTag || 'en';
i18n.locale = deviceLocale;

// When a value is missing from a language it'll fall back to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
