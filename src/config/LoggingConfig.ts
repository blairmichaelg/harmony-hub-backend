// src/config/LoggingConfig.ts

import convict from 'convict';
import { z } from 'zod';

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
 * Schema for external logging service configuration
 */
const ExternalLoggingServiceSchema = z.object({
  enabled: z.boolean().describe('Enable external logging service'),
  type: z.enum(['elk', 'splunk', 'other']).describe('Type of external logging service'),
  endpoint: z.string().url().describe('Endpoint URL of the external logging service'),
});

/**
 * Schema for error tracking configuration
 */
const ErrorTrackingConfigSchema = z.object({
  enabled: z.boolean().describe('Enable error tracking'),
  provider: z.enum(['sentry', 'rollbar', 'other']).describe('Error tracking provider'),
  dsn: z.string().describe('DSN (Data Source Name) for the error tracking service'),
});

/**
 * Schema for logging configuration
 * @remarks
 * This schema defines the structure and validation rules for the logging configuration.
 */
const LoggingConfigSchema = convict({
  console: {
    doc: 'Console logger configuration',
    format: LoggerConfigSchema,
    default: {
      level: 'info',
      format: 'colorized',
      timestamp: true,
    },
    env: 'LOGGING_CONSOLE',
  },
  file: {
    doc: 'File logger configuration',
    format: FileLoggerConfigSchema,
    default: {
      level: 'info',
      format: 'json',
      timestamp: true,
      filename: 'app.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    },
    env: 'LOGGING_FILE',
  },
  anonymization: {
    doc: 'Log anonymization configuration',
    format: AnonymizationConfigSchema,
    default: {
      enabled: false,
      fields: ['email', 'password', 'creditCard'],
    },
    env: 'LOGGING_ANONYMIZATION',
  },
  rotation: {
    doc: 'Log rotation configuration',
    format: RotationConfigSchema,
    default: {
      enabled: true,
      frequency: 'daily',
      maxRetentionPeriod: 30,
    },
    env: 'LOGGING_ROTATION',
  },
  externalLoggingService: {
    doc: 'External logging service configuration',
    format: ExternalLoggingServiceSchema,
    default: {
      enabled: false,
      type: 'elk',
      endpoint: '',
    },
    env: 'LOGGING_EXTERNAL_SERVICE',
  },
  errorTracking: {
    doc: 'Error tracking configuration',
    format: ErrorTrackingConfigSchema,
    default: {
      enabled: false,
      provider: 'sentry',
      dsn: '',
    },
    env: 'LOGGING_ERROR_TRACKING',
  },
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
export const loggingConfig = LoggingConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  LoggingConfigSchema.validate(loggingConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Logging configuration validation failed:', error.message);
    throw new Error('Invalid logging configuration');
  }
  throw error;
}

export default loggingConfig;
