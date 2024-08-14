// src/config/LoggingConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for basic logger configuration
 * @remarks
 * This schema defines the structure and validation rules for the logger configuration.
 */
export const LoggingConfigSchema = convict({
  level: {
    doc: 'Logging level',
    format: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  file: {
    doc: 'File path for logging output',
    format: String,
    default: 'logs/app.log',
    env: 'LOG_FILE',
  },
  console: {
    doc: 'Enable console logging',
    format: Boolean,
    default: true,
    env: 'LOG_CONSOLE',
  },
  anonymization: {
    doc: 'Log anonymization configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether log anonymization is enabled'),
      fields: z.array(z.string()).describe('List of fields to anonymize'),
      // Add more anonymization-specific fields as needed
    }),
    default: {
      enabled: false,
      fields: ['email', 'password'],
    },
    env: 'LOG_ANONYMIZATION',
  },
  // Add more fields as needed for future extensibility
});

export type LoggingConfig = z.ZodType<any, any, any>;

const config = LoggingConfigSchema.getProperties();

export const loggingConfig: LoggingConfig = config as unknown as LoggingConfig;

// Validate the configuration
try {
  LoggingConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Logging configuration validation failed:', error.message);
    throw new Error('Invalid logging configuration');
  }
  throw error;
}

export default loggingConfig;
