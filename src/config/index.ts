// index.ts

import { AIServicesConfig, aiServicesConfig } from './AIServicesConfig';
import { AudioProcessingConfig, audioProcessingConfig } from './AudioProcessingConfig';
import { AuthConfig, authConfig } from './AuthConfig';
import cacheConfig from './CacheConfig';
import databaseConfig from './DatabaseConfig';
import envConfig from './EnvironmentConfig';
import featureFlagConfig, { FeatureFlagConfigType } from './FeatureFlagConfig';
import { LocalizationConfig, localizationConfig } from './LocalizationConfig';
import { LoggingConfig, loggingConfig } from './LoggingConfig';
import { PerformanceConfig, performanceConfig } from './PerformanceConfig';
import redisConfig, { IRedisConfigType } from './redis';
import { SecurityConfig, securityConfig } from './SecurityConfig';
import serverConfig, { IServerConfigType } from './server';
import { StorageConfig, storageConfig } from './StorageConfig';

interface IAppConfig {
  environment: typeof envConfig;
  database: typeof databaseConfig;
  server: IServerConfigType;
  redis: IRedisConfigType;
  cache: typeof cacheConfig;
  auth: typeof authConfig;
  storage: typeof storageConfig;
  audioProcessing: typeof audioProcessingConfig;
  aiServices: typeof aiServicesConfig;
  logging: typeof loggingConfig;
  security: typeof securityConfig;
  featureFlags: FeatureFlagConfigType;
  localization: typeof localizationConfig;
  performance: typeof performanceConfig;
}

const config: IAppConfig = {
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
};

export { config };

export type {
  AIServicesConfig,
  AudioProcessingConfig,
  AuthConfig,
  FeatureFlagConfigType,
  IAppConfig,
  IRedisConfigType,
  IServerConfigType,
  LocalizationConfig,
  LoggingConfig,
  PerformanceConfig,
  SecurityConfig,
  StorageConfig,
};

// Re-export the config objects for direct access if needed
export { cacheConfig, databaseConfig, envConfig, featureFlagConfig, redisConfig, serverConfig };
