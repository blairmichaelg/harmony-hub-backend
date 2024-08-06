// LocalizationConfig.ts

import { z } from 'zod';

import { getEnvVariables } from '../utils/envUtils';

const dateTimeFormatSchema = z.object({
  shortDate: z.string(),
  longDate: z.string(),
  time: z.string(),
});

const numberFormatSchema = z.object({
  currency: z.string(),
  decimal: z.string(),
  thousandsSeparator: z.string(),
});

const localizationConfigSchema = z.object({
  defaultLocale: z.string(),
  supportedLocales: z.array(z.string()),
  fallbackLocale: z.string(),
  translationFilePath: z.string(),
  dateTimeFormat: dateTimeFormatSchema,
  numberFormat: numberFormatSchema,
});

type LocalizationConfig = z.infer<typeof localizationConfigSchema>;

const env = getEnvVariables();

const DEFAULT_LOCALES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];

const localizationConfig: LocalizationConfig = localizationConfigSchema.parse({
  defaultLocale: env.LOCALIZATION_DEFAULT_LOCALE || 'en-US',
  supportedLocales: env.LOCALIZATION_SUPPORTED_LOCALES
    ? env.LOCALIZATION_SUPPORTED_LOCALES.split(',')
    : DEFAULT_LOCALES,
  fallbackLocale: env.LOCALIZATION_FALLBACK_LOCALE || 'en-US',
  translationFilePath: env.LOCALIZATION_TRANSLATION_FILE_PATH || './src/locales',
  dateTimeFormat: {
    shortDate: env.LOCALIZATION_DATE_FORMAT_SHORT || 'yyyy-MM-dd',
    longDate: env.LOCALIZATION_DATE_FORMAT_LONG || 'MMMM dd, yyyy',
    time: env.LOCALIZATION_TIME_FORMAT || 'HH:mm:ss',
  },
  numberFormat: {
    currency: env.LOCALIZATION_CURRENCY_FORMAT || '$#,##0.00',
    decimal: env.LOCALIZATION_DECIMAL_SEPARATOR || '.',
    thousandsSeparator: env.LOCALIZATION_THOUSANDS_SEPARATOR || ',',
  },
});

export { localizationConfig, LocalizationConfig };
