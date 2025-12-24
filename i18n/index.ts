import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import pt from './locales/pt-BR.json';

const i18n = new I18n({
  en,
  'pt-BR': pt,
});

const deviceLocale = getLocales()[0]?.languageTag || 'en';
i18n.locale = deviceLocale;

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
