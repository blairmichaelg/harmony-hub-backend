// src/config/LoggingConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Enum for log levels
 */
z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);

/**
 * Schema for basic logger configuration
 * @remarks
 * This schema defines the structure and validation rules for the logger configuration.
 */
const LoggingConfigSchema = convict({
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
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for logging configuration
 */
export interface ILoggingConfig {
  level: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
  file: string;
  console: boolean;
}

/**
 * Logging configuration object
 * @remarks
 * This object contains the parsed and validated logging configuration.
 */
const config = LoggingConfigSchema.getProperties();

export const loggingConfig: ILoggingConfig = config as unknown as ILoggingConfig;

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
