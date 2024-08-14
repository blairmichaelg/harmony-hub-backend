// src/config/RedisConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for Redis configuration
 * @remarks
 * This schema defines the structure and validation rules for the Redis configuration.
 */
export const RedisConfigSchema = convict({
  host: {
    doc: 'Redis server host',
    format: z.string().describe('Redis server host'),
    default: 'localhost',
    env: 'REDIS_HOST',
  },
  port: {
    doc: 'Redis server port',
    format: z.number().int().positive().describe('Redis server port'),
    default: 6379,
    env: 'REDIS_PORT',
  },
  password: {
    doc: 'Password for Redis server',
    format: z.string().describe('Password for Redis server'),
    default: '',
    env: 'REDIS_PASSWORD',
    sensitive: true,
  },
  db: {
    doc: 'Redis database index',
    format: z.number().int().describe('Redis database index'),
    default: 0,
    env: 'REDIS_DB',
  },
  // Add more fields as needed for future extensibility
});

// Define the RedisConfig type based on the schema
export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  // Add more fields as needed for future extensibility
}

const config = RedisConfigSchema.getProperties();

export const redisConfig: RedisConfig = config as unknown as RedisConfig;

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
