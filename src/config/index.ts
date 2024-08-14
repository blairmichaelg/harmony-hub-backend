// src/config/index.ts

import convict from 'convict';

import logger from '../utils/logging';
import { AIServicesConfigSchema, aiServicesConfig } from './AIServicesConfig';
import {
  AudioProcessingConfigSchema,
  audioProcessingConfig,
} from './AudioProcessingConfig';
import { AuthConfigSchema, authConfig } from './AuthConfig';
import { cacheConfig, cacheConfigSchema } from './CacheConfig'; // Updated import
import { DatabaseConfigSchema, databaseConfig } from './DatabaseConfig';
import { EmailConfigSchema, emailConfig } from './EmailConfig';
import {
  EnvironmentConfigSchema,
  environmentConfig,
} from './EnvironmentConfig';
import {
  FeatureFlagsConfigSchema,
  featureFlagsConfig,
} from './FeatureFlagConfig';
import {
  LocalizationConfigSchema,
  localizationConfig,
} from './LocalizationConfig';
import { LoggingConfigSchema, loggingConfig } from './LoggingConfig';
import {
  NotificationConfigSchema,
  notificationConfig,
} from './NotificationConfig';
import {
  PerformanceConfigSchema,
  performanceConfig,
} from './PerformanceConfig';
import { RateLimitConfigSchema, rateLimitConfig } from './RateLimitConfig';
import { RedisConfigSchema, redisConfig } from './RedisConfig';
import { SecurityConfigSchema, securityConfig } from './SecurityConfig';
import { ServerConfigSchema, serverConfig } from './ServerConfig';
import { StorageConfigSchema, storageConfig } from './StorageConfig';

// Define a union type for all configuration schemas
type ConfigSchema =
  | typeof AIServicesConfigSchema
  | typeof AudioProcessingConfigSchema
  | typeof AuthConfigSchema
  | typeof cacheConfigSchema // Updated type
  | typeof DatabaseConfigSchema
  | typeof EmailConfigSchema
  | typeof EnvironmentConfigSchema
  | typeof FeatureFlagsConfigSchema
  | typeof LocalizationConfigSchema
  | typeof LoggingConfigSchema
  | typeof NotificationConfigSchema
  | typeof PerformanceConfigSchema
  | typeof RateLimitConfigSchema
  | typeof RedisConfigSchema
  | typeof SecurityConfigSchema
  | typeof ServerConfigSchema
  | typeof StorageConfigSchema;

// Validate all configurations
const configs: { name: string; config: ConfigSchema }[] = [
  { name: 'AI Services', config: AIServicesConfigSchema },
  { name: 'Audio Processing', config: AudioProcessingConfigSchema },
  { name: 'Auth', config: AuthConfigSchema },
  { name: 'Cache', config: cacheConfigSchema }, // Updated config
  { name: 'Database', config: DatabaseConfigSchema },
  { name: 'Email', config: EmailConfigSchema },
  { name: 'Environment', config: EnvironmentConfigSchema },
  { name: 'Feature Flag', config: FeatureFlagsConfigSchema },
  { name: 'Localization', config: LocalizationConfigSchema },
  { name: 'Logging', config: LoggingConfigSchema },
  { name: 'Notification', config: NotificationConfigSchema },
  { name: 'Performance', config: PerformanceConfigSchema },
  { name: 'Rate Limit', config: RateLimitConfigSchema },
  { name: 'Redis', config: RedisConfigSchema },
  { name: 'Security', config: SecurityConfigSchema },
  { name: 'Server', config: ServerConfigSchema },
  { name: 'Storage', config: StorageConfigSchema },
];

configs.forEach(({ name, config: configItem }) => {
  try {
    convict(configItem).validate({ allowed: 'strict' });
    logger.info(`${name} configuration validated successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`${name} configuration validation failed: ${error.message}`);
      throw new Error(`Invalid ${name} configuration`);
    }
    throw error;
  }
});

// Export all configurations
export {
  aiServicesConfig,
  audioProcessingConfig,
  authConfig,
  cacheConfig, // Updated export
  databaseConfig,
  emailConfig,
  environmentConfig,
  featureFlagsConfig,
  localizationConfig,
  loggingConfig,
  notificationConfig,
  performanceConfig,
  rateLimitConfig,
  redisConfig,
  securityConfig,
  serverConfig,
  storageConfig,
};
