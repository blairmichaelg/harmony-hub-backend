import { z } from 'zod';

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

const logLevelSchema = z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']);

const getLogLevel = (
  envVar: string,
  defaultLevel: z.infer<typeof logLevelSchema>
): z.infer<typeof logLevelSchema> => {
  const level = getEnvVar(envVar, defaultLevel);

  if (!logLevelSchema.safeParse(level).success) {
    console.warn(`Invalid log level "${level}" for ${envVar}, using default "${defaultLevel}"`);

    return defaultLevel;
  }

  return level as z.infer<typeof logLevelSchema>;
};

const customTransportSchema = z.object({
  name: z.string(),
  options: z.record(z.unknown()),
});

const fileTransportSchema = z.object({
  enabled: z.boolean(),
  level: logLevelSchema,
  filename: z.string(),
  maxsize: z.number(),
  maxFiles: z.number(),
  compress: z.boolean().default(false),
});

const loggingConfigSchema = z.object({
  default: z.object({
    level: logLevelSchema,
    format: z.enum(['json', 'simple', 'colorized']),
  }),
  console: z.object({
    enabled: z.boolean(),
    level: logLevelSchema,
  }),
  file: fileTransportSchema,
  customTransports: z.array(customTransportSchema).optional(),
});

type LoggingConfig = z.infer<typeof loggingConfigSchema>;

const loggingConfig: Readonly<LoggingConfig> = Object.freeze(
  loggingConfigSchema.parse({
    default: {
      level: getLogLevel('LOG_LEVEL', 'info'),
      format: getEnvVar('LOG_FORMAT', 'json') as 'json' | 'simple' | 'colorized',
    },
    console: {
      enabled: getEnvVar('LOG_CONSOLE_ENABLED', 'true') === 'true',
      level: getLogLevel('LOG_CONSOLE_LEVEL', getLogLevel('LOG_LEVEL', 'info')),
    },
    file: {
      enabled: getEnvVar('LOG_FILE_ENABLED', 'false') === 'true',
      level: getLogLevel('LOG_FILE_LEVEL', getLogLevel('LOG_LEVEL', 'info')),
      filename: getEnvVar('LOG_FILE_FILENAME', 'app.log'),
      maxsize: parseInt(getEnvVar('LOG_FILE_MAX_SIZE', '10485760'), 10), // 10MB default
      maxFiles: parseInt(getEnvVar('LOG_FILE_MAX_FILES', '5'), 10),
      compress: getEnvVar('LOG_FILE_COMPRESS', 'false') === 'true',
    },
    customTransports: JSON.parse(getEnvVar('CUSTOM_LOG_TRANSPORTS', '[]')),
  })
);

export { loggingConfig, LoggingConfig };
