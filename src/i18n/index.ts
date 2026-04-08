import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from '@/src/i18n/resources/en';

const resources = {
  en: { translation: en },
} as const;

const i18nextInstance = createInstance();

if (!i18nextInstance.isInitialized) {
  void i18nextInstance.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18nextInstance;
