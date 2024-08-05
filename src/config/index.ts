// index.ts

import aiServicesConfig from './AIServicesConfig';
import audioProcessingConfig from './AudioProcessingConfig';
import authConfig from './AuthConfig';
import cacheConfig from './CacheConfig';
import databaseConfig from './DatabaseConfig';
import environmentConfig from './EnvironmentConfig';
import featureFlagConfig from './FeatureFlagConfig';
import loggingConfig from './LoggingConfig';
import redisConfig from './redis';
import securityConfig from './SecurityConfig';
import serverConfig from './server';
import storageConfig from './StorageConfig';

const config = {
  environment: environmentConfig,
  database: databaseConfig,
  cache: cacheConfig,
  auth: authConfig,
  storage: storageConfig,
  audioProcessing: audioProcessingConfig,
  aiServices: aiServicesConfig,
  logging: loggingConfig,
  security: securityConfig,
  featureFlags: featureFlagConfig,
  redis: redisConfig,
  server: serverConfig,
};

export default config;
