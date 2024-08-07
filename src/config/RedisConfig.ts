// src/config/RedisConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for Redis configuration
 * @remarks
 * This schema defines the structure and validation rules for the Redis configuration.
 */
export const RedisConfigSchema = z.object({
  host: z.string().default('localhost').describe('Redis server host'),
  port: z.coerce.number().int().positive().default(6379).describe('Redis server port'),
  password: z.string().default('').describe('Redis server password'),
  db: z.coerce.number().int().nonnegative().default(0).describe('Redis database number'),
  tls: z.coerce.boolean().default(false).describe('Enable TLS for Redis connection'),
  connectTimeout: z.coerce
    .number()
    .int()
    .positive()
    .default(10000)
    .describe('Connection timeout in milliseconds'),
  maxRetriesPerRequest: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3)
    .describe('Maximum number of retries per request'),
  enableReadyCheck: z.coerce
    .boolean()
    .default(true)
    .describe('Enable ready check before operations'),
  keyPrefix: z.string().default('harmonyhub:').describe('Prefix for all Redis keys'),
});

/**
 * Type definition for Redis configuration
 */
export type RedisConfig = z.infer<typeof RedisConfigSchema>;

/**
 * Redis configuration object
 * @remarks
 * This object contains the parsed and validated Redis configuration.
 */
export const redisConfig: RedisConfig = RedisConfigSchema.parse({
  host: getEnvVar('REDIS_HOST', 'localhost'),
  port: getEnvVar('REDIS_PORT', '6379'),
  password: getEnvVar('REDIS_PASSWORD', ''),
  db: getEnvVar('REDIS_DB', '0'),
  tls: getEnvVar('REDIS_TLS', 'false'),
  connectTimeout: getEnvVar('REDIS_CONNECT_TIMEOUT', '10000'),
  maxRetriesPerRequest: getEnvVar('REDIS_MAX_RETRIES', '3'),
  enableReadyCheck: getEnvVar('REDIS_ENABLE_READY_CHECK', 'true'),
  keyPrefix: getEnvVar('REDIS_KEY_PREFIX', 'harmonyhub:'),
});

// Validate the configuration
try {
  RedisConfigSchema.parse(redisConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Redis configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid Redis configuration');
  }
  throw error;
}

export default redisConfig;
