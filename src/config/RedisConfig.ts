// src/config/RedisConfig.ts

import convict from 'convict';

/**
 * Schema for Redis configuration
 * @remarks
 * This schema defines the structure and validation rules for the Redis configuration.
 */
const RedisConfigSchema = convict({
  host: {
    doc: 'Redis server host',
    format: String,
    default: 'localhost',
    env: 'REDIS_HOST',
  },
  port: {
    doc: 'Redis server port',
    format: 'port',
    default: 6379,
    env: 'REDIS_PORT',
  },
  password: {
    doc: 'Password for Redis server',
    format: String,
    default: '',
    env: 'REDIS_PASSWORD',
    sensitive: true,
  },
  db: {
    doc: 'Redis database index',
    format: 'int',
    default: 0,
    env: 'REDIS_DB',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for Redis configuration
 */
export interface IRedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
}

/**
 * Redis configuration object
 * @remarks
 * This object contains the parsed and validated Redis configuration.
 */
const config = RedisConfigSchema.getProperties();

export const redisConfig: IRedisConfig = config as unknown as IRedisConfig;

// Validate the configuration
try {
  RedisConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Redis configuration validation failed:', error.message);
    throw new Error('Invalid Redis configuration');
  }
  throw error;
}

export default redisConfig;
