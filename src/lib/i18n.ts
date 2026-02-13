import type { Locale } from '@/i18n.config';

const dictionaries = {
  en: () => import('@/locales/en.json').then(module => module.default),
  de: () => import('@/locales/de.json').then(module => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const dictionary = dictionaries[locale] || dictionaries.de;
  return dictionary();
}