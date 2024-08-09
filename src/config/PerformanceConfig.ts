// src/config/PerformanceConfig.ts

import { cpus } from 'os';

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for caching configuration
 */
const CachingConfigSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable caching'),
  type: z.enum(['memory', 'redis']).describe('Caching type'),
  ttl: z.coerce.number().int().nonnegative().describe('Time-to-live for cached items in seconds'),
  maxItems: z.coerce.number().int().positive().describe('Maximum number of items to cache'),
});

/**
 * Schema for compression configuration
 */
const CompressionConfigSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable compression'),
  level: z.coerce.number().int().min(0).max(9).describe('Compression level (0-9)'),
  threshold: z.coerce.number().int().positive().describe('Compression threshold in bytes'),
});

/**
 * Schema for clustering configuration
 */
const ClusteringConfigSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable clustering'),
  numWorkers: z.coerce.number().int().positive().describe('Number of worker processes'),
});

/**
 * Schema for load balancing configuration
 */
const LoadBalancingConfigSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable load balancing'),
  strategy: z
    .enum(['round-robin', 'least-connections', 'ip-hash'])
    .describe('Load balancing strategy'),
});

/**
 * Schema for CDN configuration
 */
const CdnConfigSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable CDN'),
  provider: z.string().describe('CDN provider'),
  domain: z.string().url().optional().describe('CDN domain URL'),
});

/**
 * Schema for database connection pooling configuration
 */
const DatabaseConnectionPoolingSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable database connection pooling'),
  max: z.coerce.number().int().positive().describe('Maximum number of connections in the pool'),
  min: z.coerce.number().int().nonnegative().describe('Minimum number of idle connections'),
  idleTimeoutMillis: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe('Idle connection timeout in milliseconds'),
});

/**
 * Schema for background job processing configuration
 */
const BackgroundJobProcessingSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable background job processing'),
  concurrency: z.coerce.number().int().positive().describe('Number of concurrent workers'),
  queue: z.string().describe('Name of the job queue'),
});

/**
 * Schema for performance configuration
 * @remarks
 * This schema defines the structure and validation rules for the performance configuration.
 */
const PerformanceConfigSchema = convict({
  caching: {
    doc: 'Caching configuration',
    format: CachingConfigSchema,
    default: {
      enabled: true,
      type: 'memory',
      ttl: 3600, // 1 hour
      maxItems: 1000,
    },
    env: 'PERF_CACHING',
  },
  compression: {
    doc: 'Compression configuration',
    format: CompressionConfigSchema,
    default: {
      enabled: true,
      level: 6,
      threshold: 1024, // 1KB
    },
    env: 'PERF_COMPRESSION',
  },
  clustering: {
    doc: 'Clustering configuration',
    format: ClusteringConfigSchema,
    default: {
      enabled: false,
      numWorkers: cpus().length,
    },
    env: 'PERF_CLUSTERING',
  },
  loadBalancing: {
    doc: 'Load balancing configuration',
    format: LoadBalancingConfigSchema,
    default: {
      enabled: false,
      strategy: 'round-robin',
    },
    env: 'PERF_LOAD_BALANCING',
  },
  cdn: {
    doc: 'CDN configuration',
    format: CdnConfigSchema,
    default: {
      enabled: false,
      provider: 'cloudflare',
      domain: '',
    },
    env: 'PERF_CDN',
  },
  databaseConnectionPooling: {
    doc: 'Database connection pooling configuration',
    format: DatabaseConnectionPoolingSchema,
    default: {
      enabled: true,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000, // 30 seconds
    },
    env: 'PERF_DB_CONNECTION_POOLING',
  },
  backgroundJobProcessing: {
    doc: 'Background job processing configuration',
    format: BackgroundJobProcessingSchema,
    default: {
      enabled: false,
      concurrency: 5,
      queue: 'default',
    },
    env: 'PERF_BACKGROUND_JOB_PROCESSING',
  },
});

/**
 * Type definition for performance configuration
 */
export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

/**
 * Performance configuration object
 * @remarks
 * This object contains the parsed and validated performance configuration.
 */
export const performanceConfig = PerformanceConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  PerformanceConfigSchema.validate(performanceConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Performance configuration validation failed:', error.message);
    throw new Error('Invalid performance configuration');
  }
  throw error;
}

export default performanceConfig;
