// src/config/LoggingConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

/**
 * Enum for log levels
 */
const LogLevelEnum = z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);

/**
 * Schema for basic logger configuration
 */
const LoggerConfigSchema = z.object({
  level: LogLevelEnum.describe('Log level'),
  format: z.enum(['json', 'simple', 'colorized']).describe('Log format'),
  timestamp: z.boolean().describe('Include timestamp in logs'),
});

/**
 * Schema for file logger configuration
 */
const FileLoggerConfigSchema = LoggerConfigSchema.extend({
  filename: z.string().describe('Log file name'),
  maxsize: z.coerce.number().int().positive().describe('Maximum size of log file in bytes'),
  maxFiles: z.coerce.number().int().positive().describe('Maximum number of log files to keep'),
});

/**
 * Schema for log anonymization configuration
 */
const AnonymizationConfigSchema = z.object({
  enabled: z.boolean().describe('Enable log anonymization'),
  fields: z.array(z.string()).describe('Fields to anonymize in logs'),
});

/**
 * Schema for log rotation configuration
 */
const RotationConfigSchema = z.object({
  enabled: z.boolean().describe('Enable log rotation'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).describe('Log rotation frequency'),
  maxRetentionPeriod: z.coerce
    .number()
    .int()
    .positive()
    .describe('Maximum log retention period in days'),
});

/**
 * Schema for logging configuration
 * @remarks
 * This schema defines the structure and validation rules for the logging configuration.
 */
export const LoggingConfigSchema = z.object({
  console: LoggerConfigSchema.describe('Console logger configuration'),
  file: FileLoggerConfigSchema.describe('File logger configuration'),
  anonymization: AnonymizationConfigSchema.describe('Log anonymization configuration'),
  rotation: RotationConfigSchema.describe('Log rotation configuration'),
});

/**
 * Type definition for logging configuration
 */
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

/**
 * Logging configuration object
 * @remarks
 * This object contains the parsed and validated logging configuration.
 */
export const loggingConfig: LoggingConfig = LoggingConfigSchema.parse({
  console: {
    level: getEnvVar('LOGGING_CONSOLE_LEVEL', 'info'),
    format: getEnvVar('LOGGING_CONSOLE_FORMAT', 'colorized'),
    timestamp: getEnvVar('LOGGING_CONSOLE_TIMESTAMP', 'true') === 'true',
  },
  file: {
    level: getEnvVar('LOGGING_FILE_LEVEL', 'info'),
    format: getEnvVar('LOGGING_FILE_FORMAT', 'json'),
    timestamp: getEnvVar('LOGGING_FILE_TIMESTAMP', 'true') === 'true',
    filename: getEnvVar('LOGGING_FILE_FILENAME', 'app.log'),
    maxsize: getEnvVar('LOGGING_FILE_MAXSIZE', '10485760'), // 10MB
    maxFiles: getEnvVar('LOGGING_FILE_MAXFILES', '5'),
  },
  anonymization: {
    enabled: getEnvVar('LOGGING_ANONYMIZATION_ENABLED', 'false') === 'true',
    fields: parseJSON(
      getEnvVar('LOGGING_ANONYMIZATION_FIELDS', '["email", "password", "creditCard"]')
    ),
  },
  rotation: {
    enabled: getEnvVar('LOGGING_ROTATION_ENABLED', 'true') === 'true',
    frequency: getEnvVar('LOGGING_ROTATION_FREQUENCY', 'daily'),
    maxRetentionPeriod: getEnvVar('LOGGING_ROTATION_MAX_RETENTION_PERIOD', '30'),
  },
});

// Validate the configuration
try {
  LoggingConfigSchema.parse(loggingConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Logging configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid logging configuration');
  }
  throw error;
}

export default loggingConfig;
