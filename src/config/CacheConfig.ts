// src/config/CacheConfig.ts

import convict from 'convict';
import { z } from 'zod';

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
const CacheConfigSchema = convict({
  defaultProvider: {
    doc: 'Default cache provider',
    format: ['redis', 'memcached', 'local'],
    default: 'local',
    env: 'CACHE_DEFAULT_PROVIDER',
  },
  redis: {
    doc: 'Redis configuration',
    format: CacheProviderSchema.extend({
      maxRetriesPerRequest: z.coerce
        .number()
        .int()
        .nonnegative()
        .default(3)
        .describe('Maximum retries per request'),
    }),
    default: null,
    env: 'CACHE_REDIS',
  },
  memcached: {
    doc: 'Memcached configuration',
    format: CacheProviderSchema,
    default: null,
    env: 'CACHE_MEMCACHED',
  },
  local: {
    doc: 'Local cache configuration',
    format: z.object({
      maxSize: z.coerce.number().int().positive().default(100).describe('Local cache maximum size'),
      ttl: z.coerce
        .number()
        .int()
        .nonnegative()
        .default(300)
        .describe('Local cache TTL in seconds'),
    }),
    default: {
      maxSize: 100,
      ttl: 300,
    },
    env: 'CACHE_LOCAL',
  },
  distributedLock: {
    doc: 'Distributed lock configuration',
    format: z.object({
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
    }),
    default: {
      ttl: 30000,
      retryDelay: 200,
    },
    env: 'CACHE_DISTRIBUTED_LOCK',
  },
});

CacheConfigSchema.validate({ allowed: 'strict' });

/**
 * Type definition for the cache configuration
 */
export type CacheConfig = z.infer<typeof CacheConfigSchema>;

/**
 * The cache configuration object
 * @remarks
 * This object contains all the cache-related settings and is validated against CacheConfigSchema.
 */
export const cacheConfig = CacheConfigSchema.validate({});

// Validate the configuration
try {
  CacheConfigSchema.validate(cacheConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Cache configuration validation failed:', error.message);
    throw new Error('Invalid cache configuration');
  }
  throw error;
}

export default cacheConfig;
