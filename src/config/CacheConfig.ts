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
  ttl: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(3600)
    .describe('Time-to-live for cache entries in seconds'),
  maxSize: z.coerce
    .number()
    .int()
    .positive()
    .default(1000)
    .describe('Maximum number of items in the cache'),
  enableLogging: z.boolean().default(true).describe('Enable logging for cache operations'),
  // Add more fields as needed for future extensibility
});

/**
 * Configuration schema for the caching system
 */
const cacheConfigSchema = convict({
  cacheProvider: {
    doc: 'Cache provider configuration',
    format: CacheProviderSchema,
    default: {
      url: 'http://localhost:6379',
      ttl: 3600,
      maxSize: 1000,
      enableLogging: true,
    },
    env: 'CACHE_PROVIDER',
  },
  // Add more configuration options as needed
});

export { cacheConfigSchema };
