import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from '@/src/i18n/resources/en';
import { tr } from '@/src/i18n/resources/tr';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
} as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode;
const fallbackLanguage = deviceLanguage === 'tr' ? 'tr' : 'en';
const i18nextInstance = createInstance();

if (!i18nextInstance.isInitialized) {
  void i18nextInstance.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: fallbackLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18nextInstance;
