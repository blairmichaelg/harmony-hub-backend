// src/config/LocalizationConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

/**
 * Schema for date and time format configuration
 */
const DateTimeFormatSchema = z.object({
  shortDate: z.string().describe('Short date format'),
  longDate: z.string().describe('Long date format'),
  time: z.string().describe('Time format'),
});

/**
 * Schema for number format configuration
 */
const NumberFormatSchema = z.object({
  currency: z.string().describe('Currency format'),
  decimal: z.string().describe('Decimal separator'),
  thousandsSeparator: z.string().describe('Thousands separator'),
});

/**
 * Schema for localization configuration
 * @remarks
 * This schema defines the structure and validation rules for the localization configuration.
 */
export const LocalizationConfigSchema = z.object({
  defaultLocale: z.string().describe('Default locale for the application'),
  supportedLocales: z.array(z.string()).min(1).describe('List of supported locales'),
  fallbackLocale: z.string().describe('Fallback locale when the requested locale is not available'),
  translationFilePath: z.string().describe('Path to translation files'),
  dateTimeFormat: DateTimeFormatSchema.describe('Date and time format settings'),
  numberFormat: NumberFormatSchema.describe('Number format settings'),
});

/**
 * Type definition for localization configuration
 */
export type LocalizationConfig = z.infer<typeof LocalizationConfigSchema>;

const DEFAULT_LOCALES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];

/**
 * Localization configuration object
 * @remarks
 * This object contains the parsed and validated localization configuration.
 */
export const localizationConfig: LocalizationConfig = LocalizationConfigSchema.parse({
  defaultLocale: getEnvVar('LOCALIZATION_DEFAULT_LOCALE', 'en-US'),
  supportedLocales: parseJSON(
    getEnvVar('LOCALIZATION_SUPPORTED_LOCALES', JSON.stringify(DEFAULT_LOCALES))
  ),
  fallbackLocale: getEnvVar('LOCALIZATION_FALLBACK_LOCALE', 'en-US'),
  translationFilePath: getEnvVar('LOCALIZATION_TRANSLATION_FILE_PATH', './src/locales'),
  dateTimeFormat: {
    shortDate: getEnvVar('LOCALIZATION_DATE_FORMAT_SHORT', 'yyyy-MM-dd'),
    longDate: getEnvVar('LOCALIZATION_DATE_FORMAT_LONG', 'MMMM dd, yyyy'),
    time: getEnvVar('LOCALIZATION_TIME_FORMAT', 'HH:mm:ss'),
  },
  numberFormat: {
    currency: getEnvVar('LOCALIZATION_CURRENCY_FORMAT', '$#,##0.00'),
    decimal: getEnvVar('LOCALIZATION_DECIMAL_SEPARATOR', '.'),
    thousandsSeparator: getEnvVar('LOCALIZATION_THOUSANDS_SEPARATOR', ','),
  },
});

// Validate the configuration
try {
  LocalizationConfigSchema.parse(localizationConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Localization configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid localization configuration');
  }
  throw error;
}

export default localizationConfig;
