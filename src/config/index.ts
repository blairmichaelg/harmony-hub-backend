// src/config/index.ts

import { z } from 'zod';

// Import all individual config schemas, types, and objects
import { AIServicesConfig, AIServicesConfigSchema, aiServicesConfig } from './AIServicesConfig';
import {
  AudioProcessingConfig,
  AudioProcessingConfigSchema,
  audioProcessingConfig,
} from './AudioProcessingConfig';
import { AuthConfig, AuthConfigSchema, authConfig } from './AuthConfig';
import { CacheConfig, CacheConfigSchema, cacheConfig } from './CacheConfig';
import { DatabaseConfig, DatabaseConfigSchema, databaseConfig } from './DatabaseConfig';
import { EnvConfig, EnvConfigSchema, envConfig } from './EnvironmentConfig';
import { FeatureFlagConfig, FeatureFlagConfigSchema, featureFlagConfig } from './FeatureFlagConfig';
import {
  LocalizationConfig,
  LocalizationConfigSchema,
  localizationConfig,
} from './LocalizationConfig';
import { LoggingConfig, LoggingConfigSchema, loggingConfig } from './LoggingConfig';
import { PerformanceConfig, PerformanceConfigSchema, performanceConfig } from './PerformanceConfig';
import { RedisConfig, RedisConfigSchema, redisConfig } from './RedisConfig';
import { SecurityConfig, SecurityConfigSchema, securityConfig } from './SecurityConfig';
import { ServerConfig, ServerConfigSchema, serverConfig } from './ServerConfig';
import { StorageConfig, StorageConfigSchema, storageConfig } from './StorageConfig';

/**
 * Schema for the entire application configuration
 * @remarks
 * This schema combines all individual config schemas and adds cross-config validations.
 */
export const AppConfigSchema = z
  .object({
    environment: EnvConfigSchema,
    database: DatabaseConfigSchema,
    server: ServerConfigSchema,
    redis: RedisConfigSchema,
    cache: CacheConfigSchema,
    auth: AuthConfigSchema,
    storage: StorageConfigSchema,
    audioProcessing: AudioProcessingConfigSchema,
    aiServices: AIServicesConfigSchema,
    logging: LoggingConfigSchema,
    security: SecurityConfigSchema,
    featureFlags: FeatureFlagConfigSchema,
    localization: LocalizationConfigSchema,
    performance: PerformanceConfigSchema,
  })
  .refine(
    (data) => {
      // Cross-config validation: SSL must be enabled in production
      return data.environment.nodeEnv === 'production' ? data.security.enableSSL : true;
    },
    {
      message: 'SSL must be enabled in production environment',
      path: ['security', 'enableSSL'],
    }
  )
  .refine(
    (data) => {
      // Cross-config validation: Database connection limit shouldn't exceed server's max connections
      return data.database.connectionLimit <= data.server.maxConnections;
    },
    {
      message: "Database connection limit cannot exceed server's max connections",
      path: ['database', 'connectionLimit'],
    }
  );

/**
 * Type definition for the entire application configuration
 */
export type AppConfig = z.infer<typeof AppConfigSchema>;

/**
 * The complete, validated application configuration object
 * @remarks
 * This object combines all individual config objects and is validated against AppConfigSchema.
 */
export const config: AppConfig = AppConfigSchema.parse({
  environment: envConfig,
  database: databaseConfig,
  server: serverConfig,
  redis: redisConfig,
  cache: cacheConfig,
  auth: authConfig,
  storage: storageConfig,
  audioProcessing: audioProcessingConfig,
  aiServices: aiServicesConfig,
  logging: loggingConfig,
  security: securityConfig,
  featureFlags: featureFlagConfig,
  localization: localizationConfig,
  performance: performanceConfig,
});

// Re-export all config types, schemas, and objects
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
  AIServicesConfigSchema,
  AudioProcessingConfigSchema,
  AuthConfigSchema,
  CacheConfigSchema,
  DatabaseConfigSchema,
  EnvConfigSchema,
  FeatureFlagConfigSchema,
  LocalizationConfigSchema,
  LoggingConfigSchema,
  PerformanceConfigSchema,
  RedisConfigSchema,
  SecurityConfigSchema,
  ServerConfigSchema,
  StorageConfigSchema,
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
  AppConfigSchema.parse(config);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid application configuration');
  }
  throw error;
}
