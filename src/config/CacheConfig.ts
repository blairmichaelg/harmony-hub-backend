// src/config/CacheConfig.ts

import { z } from 'zod';

import envConfig from './EnvironmentConfig';

const cacheProviderSchema = z.object({
  url: z.string().url(),
  ttl: z.number().int().nonnegative().default(3600),
  maxSize: z.number().int().positive().optional(),
});

const cacheSchema = z.object({
  defaultProvider: z.enum(['redis', 'memcached', 'local']).default('local'),
  redis: cacheProviderSchema
    .extend({
      maxRetriesPerRequest: z.number().int().nonnegative().default(3),
    })
    .optional(),
  memcached: cacheProviderSchema.optional(),
  local: z.object({
    maxSize: z.number().int().positive().default(100),
    ttl: z.number().int().nonnegative().default(300),
  }),
  distributedLock: z.object({
    ttl: z.number().int().positive().default(30000),
    retryDelay: z.number().int().nonnegative().default(200),
  }),
});

type CacheConfig = z.infer<typeof cacheSchema>;

const cacheConfig: Readonly<CacheConfig> = Object.freeze(
  cacheSchema.parse({
    defaultProvider: envConfig.REDIS_URL ? 'redis' : 'local',
    redis: envConfig.REDIS_URL ? { url: envConfig.REDIS_URL } : undefined,
    local: {},
    distributedLock: {},
  })
);

export default cacheConfig;
