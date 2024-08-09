// src/config/RedisConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for Redis configuration
 * @remarks
 * This schema defines the structure and validation rules for the Redis configuration.
 */
const RedisConfigSchema = convict({
  host: {
    doc: 'Redis server host',
    format: 'string',
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
    doc: 'Redis server password',
    format: 'string',
    default: '',
    env: 'REDIS_PASSWORD',
    sensitive: true,
  },
  db: {
    doc: 'Redis database number',
    format: 'nat',
    default: 0,
    env: 'REDIS_DB',
  },
  tls: {
    doc: 'Enable TLS for Redis connection',
    format: 'Boolean',
    default: false,
    env: 'REDIS_TLS',
  },
  connectTimeout: {
    doc: 'Connection timeout in milliseconds',
    format: 'nat',
    default: 10000,
    env: 'REDIS_CONNECT_TIMEOUT',
  },
  maxRetriesPerRequest: {
    doc: 'Maximum number of retries per request',
    format: 'nat',
    default: 3,
    env: 'REDIS_MAX_RETRIES',
  },
  enableReadyCheck: {
    doc: 'Enable ready check before operations',
    format: 'Boolean',
    default: true,
    env: 'REDIS_ENABLE_READY_CHECK',
  },
  keyPrefix: {
    doc: 'Prefix for all Redis keys',
    format: 'string',
    default: 'harmonyhub:',
    env: 'REDIS_KEY_PREFIX',
  },
  sentinel: {
    doc: 'Redis Sentinel configuration',
    format: z.object({
      enabled: z.boolean().describe('Enable Redis Sentinel'),
      nodes: z
        .array(
          z.object({
            host: z.string().describe('Sentinel node host'),
            port: z.number().int().positive().describe('Sentinel node port'),
          })
        )
        .describe('List of Sentinel nodes'),
      name: z.string().describe('Sentinel master group name'),
    }),
    default: {
      enabled: false,
      nodes: [],
      name: '',
    },
    env: 'REDIS_SENTINEL',
  },
  cluster: {
    doc: 'Redis Cluster configuration',
    format: z.object({
      enabled: z.boolean().describe('Enable Redis Cluster'),
      nodes: z
        .array(
          z.object({
            host: z.string().describe('Cluster node host'),
            port: z.number().int().positive().describe('Cluster node port'),
          })
        )
        .describe('List of Cluster nodes'),
    }),
    default: {
      enabled: false,
      nodes: [],
    },
    env: 'REDIS_CLUSTER',
  },
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// Create and validate the configuration object
export const redisConfig = RedisConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  RedisConfigSchema.validate(redisConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Redis configuration validation failed:', error.message);
    throw new Error('Invalid Redis configuration');
  }
  throw error;
}

export default redisConfig;
