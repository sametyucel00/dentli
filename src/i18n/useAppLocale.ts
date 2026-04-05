import { useTranslation } from 'react-i18next';

export function useAppLocale() {
  const { i18n } = useTranslation();

  return i18n.language === 'tr' ? 'tr-TR' : 'en-US';
}
