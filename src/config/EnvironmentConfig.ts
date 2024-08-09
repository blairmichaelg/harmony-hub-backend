// src/config/EnvironmentConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for environment configuration
 * @remarks
 * This schema defines the structure and validation rules for the environment configuration.
 */
const EnvConfigSchema = convict({
  nodeEnv: {
    doc: 'Node environment',
    format: ['development', 'production', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'Server port',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  logLevel: {
    doc: 'Logging level',
    format: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  databaseUrl: {
    doc: 'Database connection URL',
    format: 'url',
    default: '', // Set a default value or require this variable
    env: 'DATABASE_URL',
    sensitive: true,
  },
  redisUrl: {
    doc: 'Redis connection URL',
    format: 'url',
    default: '', // Set a default value or require this variable
    env: 'REDIS_URL',
    sensitive: true,
  },
  jwtSecret: {
    doc: 'JWT secret key',
    format: 'string',
    default:
      process.env.NODE_ENV === 'production'
        ? '' // Generate a strong secret in production
        : 'default-secret-key-for-development-only',
    env: 'JWT_SECRET',
    sensitive: true,
  },
  aws: {
    accessKeyId: {
      doc: 'AWS access key ID',
      format: 'string',
      default: '',
      env: 'AWS_ACCESS_KEY_ID',
      sensitive: true,
    },
    secretAccessKey: {
      doc: 'AWS secret access key',
      format: 'string',
      default: '',
      env: 'AWS_SECRET_ACCESS_KEY',
      sensitive: true,
    },
    region: {
      doc: 'AWS region',
      format: 'string',
      default: '',
      env: 'AWS_REGION',
    },
  },
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
export const envConfig = EnvConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  EnvConfigSchema.validate(envConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Environment configuration validation failed:', error.message);
    throw new Error('Invalid environment configuration');
  }
  throw error;
}

export default envConfig;
