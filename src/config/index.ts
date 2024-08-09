// src/config/index.ts

import convict from 'convict';
import { z } from 'zod';

import { Logger } from '../utils/logger';

const logger = new Logger('Configuration');

// Import all individual config schemas, types, and objects
import { AIServicesConfig, aiServicesConfig } from './AIServicesConfig';
import { AudioProcessingConfig, audioProcessingConfig } from './AudioProcessingConfig';
import { AuthConfig, authConfig } from './AuthConfig';
import { CacheConfig, cacheConfig } from './CacheConfig';
import { DatabaseConfig, databaseConfig } from './DatabaseConfig';
import { EnvConfig, envConfig } from './EnvironmentConfig';
import { FeatureFlagConfig, featureFlagConfig } from './FeatureFlagConfig';
import { LocalizationConfig, localizationConfig } from './LocalizationConfig';
import { LoggingConfig, loggingConfig } from './LoggingConfig';
import { PerformanceConfig, performanceConfig } from './PerformanceConfig';
import { RedisConfig, redisConfig } from './RedisConfig';
import { SecurityConfig, securityConfig } from './SecurityConfig';
import { ServerConfig, serverConfig } from './ServerConfig';
import { StorageConfig, storageConfig } from './StorageConfig';

/**
 * Schema for the entire application configuration
 * @remarks
 * This schema combines all individual config schemas and adds cross-config validations.
 */
const AppConfigSchema = convict({
  environment: {
    doc: 'Environment configuration',
    format: EnvConfig,
    default: envConfig,
  },
  database: {
    doc: 'Database configuration',
    format: DatabaseConfig,
    default: databaseConfig,
  },
  server: {
    doc: 'Server configuration',
    format: ServerConfig,
    default: serverConfig,
  },
  redis: {
    doc: 'Redis configuration',
    format: RedisConfig,
    default: redisConfig,
  },
  cache: {
    doc: 'Cache configuration',
    format: CacheConfig,
    default: cacheConfig,
  },
  auth: {
    doc: 'Authentication configuration',
    format: AuthConfig,
    default: authConfig,
  },
  storage: {
    doc: 'Storage configuration',
    format: StorageConfig,
    default: storageConfig,
  },
  audioProcessing: {
    doc: 'Audio processing configuration',
    format: AudioProcessingConfig,
    default: audioProcessingConfig,
  },
  aiServices: {
    doc: 'AI services configuration',
    format: AIServicesConfig,
    default: aiServicesConfig,
  },
  logging: {
    doc: 'Logging configuration',
    format: LoggingConfig,
    default: loggingConfig,
  },
  security: {
    doc: 'Security configuration',
    format: SecurityConfig,
    default: securityConfig,
  },
  featureFlags: {
    doc: 'Feature flags configuration',
    format: FeatureFlagConfig,
    default: featureFlagConfig,
  },
  localization: {
    doc: 'Localization configuration',
    format: LocalizationConfig,
    default: localizationConfig,
  },
  performance: {
    doc: 'Performance configuration',
    format: PerformanceConfig,
    default: performanceConfig,
  },
});

AppConfigSchema.validate({ allowed: 'strict' });

/**
 * Type definition for the entire application configuration
 */
export type AppConfig = z.infer<typeof AppConfigSchema>;

/**
 * The complete, validated application configuration object
 * @remarks
 * This object combines all individual config objects and is validated against AppConfigSchema.
 */
export const config = AppConfigSchema.validate({});

// Re-export all config types and objects
export type {
  AIServicesConfig,
  AudioProcessingConfig,
  AuthConfig,
  CacheConfig,
  DatabaseConfig,
  EnvConfig,
  FeatureFlagConfig,
  LocalizationConfig,
  LoggingConfig,
  PerformanceConfig,
  RedisConfig,
  SecurityConfig,
  ServerConfig,
  StorageConfig,
};

export {
  aiServicesConfig,
  audioProcessingConfig,
  authConfig,
  cacheConfig,
  databaseConfig,
  envConfig,
  featureFlagConfig,
  localizationConfig,
  loggingConfig,
  performanceConfig,
  redisConfig,
  securityConfig,
  serverConfig,
  storageConfig,
};

// Validate the entire configuration
try {
  AppConfigSchema.validate(config);
} catch (error) {
  if (error instanceof Error) {
    logger.error('Configuration validation failed:', error.message);
    throw new Error('Invalid application configuration');
  }
  throw error;
}

export default config;
