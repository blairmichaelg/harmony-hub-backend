// src/config/CacheConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for cache provider configuration
 * @remarks
 * Defines the structure and validation rules for cache providers.
 */
const CacheProviderSchema = z.object({
  type: z.enum(['local', 'redis']).default('local'),
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
    .optional()
    .describe('Maximum number of items in the cache (if applicable)'),
  enableLogging: z
    .boolean()
    .default(true)
    .describe('Enable logging for cache operations'),
  // Add more fields as needed for future extensibility
});

/**
 * Configuration schema for the caching system
 */
export const cacheConfigSchema = convict({
  local: {
    doc: 'Local in-memory cache configuration',
    format: CacheProviderSchema,
    default: {
      type: 'local',
      ttl: 3600,
      maxSize: 1000,
      enableLogging: true,
    },
  },
  redis: {
    doc: 'Redis cache configuration',
    format: CacheProviderSchema,
    default: {
      type: 'redis',
      ttl: 3600,
      enableLogging: true,
    },
  },
  // Add more configuration options as needed
});

// Define the CacheConfig type based on the schema
export interface CacheConfig {
  local: {
    type: 'local';
    ttl: number;
    maxSize?: number;
    enableLogging: boolean;
  };
  redis: {
    type: 'redis';
    ttl: number;
    enableLogging: boolean;
  };
  // Add more configuration options as needed
}

const config = cacheConfigSchema.getProperties();

export const cacheConfig: CacheConfig = config as unknown as CacheConfig;

try {
  cacheConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Cache configuration validation failed:', error.message);
    throw new Error('Invalid cache configuration');
  }
  throw error;
}

export default cacheConfig;
