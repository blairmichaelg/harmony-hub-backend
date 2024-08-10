// src/config/LocalizationConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for date and time format configuration
 */
z.object({
  shortDate: z.string().describe('Short date format'),
  longDate: z.string().describe('Long date format'),
  time: z.string().describe('Time format'),
});

/**
 * Schema for localization configuration
 * @remarks
 * This schema defines the structure and validation rules for the localization configuration.
 */
const LocalizationConfigSchema = convict({
  locale: {
    doc: 'Locale for the application',
    format: String,
    default: 'en-US',
    env: 'LOCALE',
  },
  dateTimeFormat: {
    doc: 'Date and time format configuration',
    format: Object,
    default: {
      shortDate: 'MM/DD/YYYY',
      longDate: 'MMMM D, YYYY',
      time: 'HH:mm:ss',
    },
    env: 'DATE_TIME_FORMAT',
  },
  timezone: {
    doc: 'Timezone for the application',
    format: String,
    default: 'UTC',
    env: 'TIMEZONE',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for date and time format configuration
 */
export interface IDateTimeFormat {
  shortDate: string;
  longDate: string;
  time: string;
}

/**
 * Interface definition for localization configuration
 */
export interface ILocalizationConfig {
  locale: string;
  dateTimeFormat: IDateTimeFormat;
  timezone: string;
}

/**
 * Localization configuration object
 * @remarks
 * This object contains the parsed and validated localization configuration.
 */
const config = LocalizationConfigSchema.getProperties();

export const localizationConfig: ILocalizationConfig = config as unknown as ILocalizationConfig;

// Validate the configuration
try {
  LocalizationConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Localization configuration validation failed:', error.message);
    throw new Error('Invalid localization configuration');
  }
  throw error;
}

export default localizationConfig;
