// src/config/EnvironmentConfig.ts

import convict from 'convict';

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
    doc: 'The port the application runs on',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  logLevel: {
    doc: 'Logging level',
    format: ['debug', 'info', 'warn', 'error'],
    default: 'info',
    env: 'LOG_LEVEL',
  },
  apiPrefix: {
    doc: 'API prefix for routing',
    format: String,
    default: '/api',
    env: 'API_PREFIX',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for environment configuration
 */
export interface IEnvironmentConfig {
  parse(env: NodeJS.ProcessEnv): unknown;
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  apiPrefix: string;
}

/**
 * Environment configuration object
 * @remarks
 * This object contains the parsed and validated environment configuration.
 */
const config = EnvConfigSchema.getProperties();

export const environmentConfig: IEnvironmentConfig = config as unknown as IEnvironmentConfig;

// Validate the configuration
try {
  EnvConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Environment configuration validation failed:', error.message);
    throw new Error('Invalid environment configuration');
  }
  throw error;
}

export default environmentConfig;
