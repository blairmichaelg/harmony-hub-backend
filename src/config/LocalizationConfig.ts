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
  dateTimeFormat: {
    doc: 'Date and time format settings',
    format: Object,
    default: {
      shortDate: 'MM/dd/yyyy',
      longDate: 'MMMM dd, yyyy',
      time: 'HH:mm:ss',
    },
  },
  // Add more localization-specific fields as needed
});

// Define the LocalizationConfig type based on the schema
export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  dateTimeFormat: {
    shortDate: string;
    longDate: string;
    time: string;
  };
  // Add more fields as needed for future extensibility
}

const config = LocalizationConfigSchema.getProperties();

export const localizationConfig: LocalizationConfig =
  config as unknown as LocalizationConfig;

// Validate the configuration
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
