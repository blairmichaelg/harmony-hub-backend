// LoggingConfig.ts

import { z } from 'zod';

import { getEnvVariables } from '../utils/envUtils';

const logLevelEnum = z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);

const loggerConfigSchema = z.object({
  level: logLevelEnum,
  format: z.enum(['json', 'simple', 'colorized']),
  timestamp: z.boolean(),
});

const fileLoggerConfigSchema = loggerConfigSchema.extend({
  filename: z.string(),
  maxsize: z.number().int().positive(),
  maxFiles: z.number().int().positive(),
});

const anonymizationConfigSchema = z.object({
  enabled: z.boolean(),
  fields: z.array(z.string()),
});

const rotationConfigSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  maxRetentionPeriod: z.number().int().positive(),
});

const loggingConfigSchema = z.object({
  console: loggerConfigSchema,
  file: fileLoggerConfigSchema,
  anonymization: anonymizationConfigSchema,
  rotation: rotationConfigSchema,
});

type LoggingConfig = z.infer<typeof loggingConfigSchema>;

const env = getEnvVariables();

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue;

const getLogLevel = (level: string | undefined): z.infer<typeof logLevelEnum> => {
  if (logLevelEnum.safeParse(level).success) {
    return level as z.infer<typeof logLevelEnum>;
  }

  return 'info';
};

const getLogFormat = (format: string | undefined): 'json' | 'simple' | 'colorized' => {
  if (format === 'json' || format === 'simple' || format === 'colorized') {
    return format;
  }

  return 'colorized';
};

const getRotationFrequency = (frequency: string | undefined): 'daily' | 'weekly' | 'monthly' => {
  if (frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly') {
    return frequency;
  }

  return 'daily';
};

const loggingConfig: LoggingConfig = loggingConfigSchema.parse({
  console: {
    level: getLogLevel(env.LOGGING_CONSOLE_LEVEL),
    format: getLogFormat(env.LOGGING_CONSOLE_FORMAT),
    timestamp: parseBoolean(env.LOGGING_CONSOLE_TIMESTAMP, true),
  },
  file: {
    level: getLogLevel(env.LOGGING_FILE_LEVEL),
    format: getLogFormat(env.LOGGING_FILE_FORMAT),
    timestamp: parseBoolean(env.LOGGING_FILE_TIMESTAMP, true),
    filename: env.LOGGING_FILE_FILENAME || 'app.log',
    maxsize: parseInt(env.LOGGING_FILE_MAXSIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(env.LOGGING_FILE_MAXFILES || '5', 10),
  },
  anonymization: {
    enabled: parseBoolean(env.LOGGING_ANONYMIZATION_ENABLED, false),
    fields: env.LOGGING_ANONYMIZATION_FIELDS
      ? env.LOGGING_ANONYMIZATION_FIELDS.split(',')
      : ['email', 'password', 'creditCard'],
  },
  rotation: {
    enabled: parseBoolean(env.LOGGING_ROTATION_ENABLED, true),
    frequency: getRotationFrequency(env.LOGGING_ROTATION_FREQUENCY),
    maxRetentionPeriod: parseInt(env.LOGGING_ROTATION_MAX_RETENTION_PERIOD || '30', 10), // days
  },
});

export { loggingConfig, LoggingConfig };
