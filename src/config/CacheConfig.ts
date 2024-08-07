// src/config/CacheConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for cache provider configuration
 * @remarks
 * Defines the structure and validation rules for cache providers.
 */
const CacheProviderSchema = z.object({
  url: z.string().url().describe('Cache provider URL'),
  ttl: z.coerce.number().int().nonnegative().default(3600).describe('Time-to-live in seconds'),
  maxSize: z.coerce.number().int().positive().optional().describe('Maximum cache size'),
});

/**
 * Schema for the entire cache configuration
 * @remarks
 * This schema defines the structure and validation rules for the cache configuration.
 */
export const CacheConfigSchema = z
  .object({
    defaultProvider: z
      .enum(['redis', 'memcached', 'local'])
      .default('local')
      .describe('Default cache provider'),
    redis: CacheProviderSchema.extend({
      maxRetriesPerRequest: z.coerce
        .number()
        .int()
        .nonnegative()
        .default(3)
        .describe('Maximum retries per request'),
    })
      .optional()
      .describe('Redis configuration'),
    memcached: CacheProviderSchema.optional().describe('Memcached configuration'),
    local: z
      .object({
        maxSize: z.coerce
          .number()
          .int()
          .positive()
          .default(100)
          .describe('Local cache maximum size'),
        ttl: z.coerce
          .number()
          .int()
          .nonnegative()
          .default(300)
          .describe('Local cache TTL in seconds'),
      })
      .describe('Local cache configuration'),
    distributedLock: z
      .object({
        ttl: z.coerce
          .number()
          .int()
          .positive()
          .default(30000)
          .describe('Distributed lock TTL in milliseconds'),
        retryDelay: z.coerce
          .number()
          .int()
          .nonnegative()
          .default(200)
          .describe('Retry delay in milliseconds'),
      })
      .describe('Distributed lock configuration'),
  })
  .refine((data) => data.defaultProvider !== 'redis' || data.redis !== undefined, {
    message: 'Redis must be configured when set as the default provider',
    path: ['redis'],
  });

/**
 * Type definition for the cache configuration
 */
export type CacheConfig = z.infer<typeof CacheConfigSchema>;

/**
 * The cache configuration object
 * @remarks
 * This object contains all the cache-related settings and is validated against CacheConfigSchema.
 */
export const cacheConfig: CacheConfig = CacheConfigSchema.parse({
  defaultProvider: getEnvVar('CACHE_DEFAULT_PROVIDER', 'local'),
  redis: getEnvVar('REDIS_URL')
    ? {
        url: getEnvVar('REDIS_URL'),
        ttl: getEnvVar('REDIS_TTL', '3600'),
        maxSize: getEnvVar('REDIS_MAX_SIZE'),
        maxRetriesPerRequest: getEnvVar('REDIS_MAX_RETRIES', '3'),
      }
    : undefined,
  memcached: getEnvVar('MEMCACHED_URL')
    ? {
        url: getEnvVar('MEMCACHED_URL'),
        ttl: getEnvVar('MEMCACHED_TTL', '3600'),
        maxSize: getEnvVar('MEMCACHED_MAX_SIZE'),
      }
    : undefined,
  local: {
    maxSize: getEnvVar('LOCAL_CACHE_MAX_SIZE', '100'),
    ttl: getEnvVar('LOCAL_CACHE_TTL', '300'),
  },
  distributedLock: {
    ttl: getEnvVar('DISTRIBUTED_LOCK_TTL', '30000'),
    retryDelay: getEnvVar('DISTRIBUTED_LOCK_RETRY_DELAY', '200'),
  },
});

// Validate the configuration
try {
  CacheConfigSchema.parse(cacheConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Cache configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid cache configuration');
  }
  throw error;
}
