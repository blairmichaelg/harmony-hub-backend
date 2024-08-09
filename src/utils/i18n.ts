// src/utils/i18n.ts

import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { initReactI18next } from 'react-i18next';

import { localizationConfig } from '../config/LocalizationConfig';

i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: localizationConfig.defaultLocale,
    fallbackLng: localizationConfig.fallbackLocale,
    supportedLngs: localizationConfig.supportedLocales,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: `${localizationConfig.translationFilePath}/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18next;
