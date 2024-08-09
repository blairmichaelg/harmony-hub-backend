// src/config/LocalizationConfig.ts

import convict from 'convict';
import { z } from 'zod';

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
const LocalizationConfigSchema = convict({
  defaultLocale: {
    doc: 'Default locale for the application',
    format: 'string',
    default: 'en-US',
    env: 'LOCALIZATION_DEFAULT_LOCALE',
  },
  supportedLocales: {
    doc: 'List of supported locales',
    format: Array,
    default: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'],
    env: 'LOCALIZATION_SUPPORTED_LOCALES',
  },
  fallbackLocale: {
    doc: 'Fallback locale when the requested locale is not available',
    format: 'string',
    default: 'en-US',
    env: 'LOCALIZATION_FALLBACK_LOCALE',
  },
  translationFilePath: {
    doc: 'Path to translation files',
    format: 'string',
    default: './src/locales',
    env: 'LOCALIZATION_TRANSLATION_FILE_PATH',
  },
  dateTimeFormat: {
    doc: 'Date and time format settings',
    format: DateTimeFormatSchema,
    default: {
      shortDate: 'yyyy-MM-dd',
      longDate: 'MMMM dd, yyyy',
      time: 'HH:mm:ss',
    },
    env: 'LOCALIZATION_DATE_TIME_FORMAT',
  },
  numberFormat: {
    doc: 'Number format settings',
    format: NumberFormatSchema,
    default: {
      currency: '$#,##0.00',
      decimal: '.',
      thousandsSeparator: ',',
    },
    env: 'LOCALIZATION_NUMBER_FORMAT',
  },
  languageDetection: {
    doc: 'Language detection configuration',
    format: z.object({
      enabled: z.boolean().describe('Enable language detection'),
      order: z.array(z.enum(['browser', 'ip'])).describe('Order of language detection methods'),
    }),
    default: {
      enabled: false,
      order: ['browser', 'ip'],
    },
    env: 'LOCALIZATION_LANGUAGE_DETECTION',
  },
  dynamicTranslationLoading: {
    doc: 'Dynamic translation loading configuration',
    format: z.object({
      enabled: z.boolean().describe('Enable dynamic translation loading'),
      cacheTtl: z.coerce
        .number()
        .int()
        .nonnegative()
        .describe('Cache TTL for loaded translations in seconds'),
    }),
    default: {
      enabled: false,
      cacheTtl: 3600, // 1 hour
    },
    env: 'LOCALIZATION_DYNAMIC_TRANSLATION_LOADING',
  },
});

/**
 * Type definition for localization configuration
 */
export type LocalizationConfig = z.infer<typeof LocalizationConfigSchema>;

/**
 * Localization configuration object
 * @remarks
 * This object contains the parsed and validated localization configuration.
 */
export const localizationConfig = LocalizationConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  LocalizationConfigSchema.validate(localizationConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Localization configuration validation failed:', error.message);
    throw new Error('Invalid localization configuration');
  }
  throw error;
}

export default localizationConfig;
