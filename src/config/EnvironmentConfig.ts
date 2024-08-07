// src/config/EnvironmentConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for environment configuration
 * @remarks
 * This schema defines the structure and validation rules for the environment configuration.
 */
export const EnvConfigSchema = z.object({
  nodeEnv: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Node environment'),
  port: z.coerce.number().int().positive().default(3000).describe('Server port'),
  logLevel: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info')
    .describe('Logging level'),
  databaseUrl: z.string().url().describe('Database connection URL'),
  redisUrl: z.string().url().optional().describe('Redis connection URL'),
  jwtSecret: z.string().min(32).describe('JWT secret key'),
  aws: z
    .object({
      accessKeyId: z.string().optional().describe('AWS access key ID'),
      secretAccessKey: z.string().optional().describe('AWS secret access key'),
      region: z.string().optional().describe('AWS region'),
    })
    .describe('AWS configuration'),
});

/**
 * Type definition for environment configuration
 */
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

/**
 * Environment configuration object
 * @remarks
 * This object contains the parsed and validated environment configuration.
 */
export const envConfig: EnvConfig = EnvConfigSchema.parse({
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVar('PORT', '3000'),
  logLevel: getEnvVar('LOG_LEVEL', 'info'),
  databaseUrl: getEnvVar('DATABASE_URL'),
  redisUrl: getEnvVar('REDIS_URL'),
  jwtSecret: getEnvVar('JWT_SECRET'),
  aws: {
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    region: getEnvVar('AWS_REGION'),
  },
});

// Validate the configuration
try {
  EnvConfigSchema.parse(envConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid environment configuration');
  }
  throw error;
}
