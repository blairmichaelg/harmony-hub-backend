// src/config/LocalizationConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for localization configuration
 * @remarks
 * This schema defines the structure and validation rules for the localization configuration.
 */
export const LocalizationConfigSchema = convict({
  defaultLocale: {
    doc: 'Default locale for the application',
    format: String,
    default: 'en-US',
    env: 'DEFAULT_LOCALE',
  },
  supportedLocales: {
    doc: 'List of supported locales',
    format: z.array(z.string()),
    default: ['en-US'],
    env: 'SUPPORTED_LOCALES',
  },
  // Add more localization-specific fields as needed
});

export type LocalizationConfig = z.ZodType<any, any, any>;

const config = LocalizationConfigSchema.getProperties();

export const localizationConfig: LocalizationConfig =
  config as unknown as LocalizationConfig;

try {
  LocalizationConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Localization configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Localization configuration');
  }
  throw error;
}

export default localizationConfig;
