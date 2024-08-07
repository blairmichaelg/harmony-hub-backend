// src/config/PerformanceConfig.ts

import { cpus } from 'os';

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

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
 * Schema for performance configuration
 * @remarks
 * This schema defines the structure and validation rules for the performance configuration.
 */
export const PerformanceConfigSchema = z.object({
  caching: CachingConfigSchema.describe('Caching configuration'),
  compression: CompressionConfigSchema.describe('Compression configuration'),
  clustering: ClusteringConfigSchema.describe('Clustering configuration'),
  loadBalancing: LoadBalancingConfigSchema.describe('Load balancing configuration'),
  cdn: CdnConfigSchema.describe('CDN configuration'),
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
export const performanceConfig: PerformanceConfig = PerformanceConfigSchema.parse({
  caching: {
    enabled: getEnvVar('PERF_CACHING_ENABLED', 'true'),
    type: getEnvVar('PERF_CACHING_TYPE', 'memory'),
    ttl: getEnvVar('PERF_CACHING_TTL', '3600'), // 1 hour
    maxItems: getEnvVar('PERF_CACHING_MAX_ITEMS', '1000'),
  },
  compression: {
    enabled: getEnvVar('PERF_COMPRESSION_ENABLED', 'true'),
    level: getEnvVar('PERF_COMPRESSION_LEVEL', '6'),
    threshold: getEnvVar('PERF_COMPRESSION_THRESHOLD', '1024'), // 1KB
  },
  clustering: {
    enabled: getEnvVar('PERF_CLUSTERING_ENABLED', 'false'),
    numWorkers: getEnvVar('PERF_CLUSTERING_NUM_WORKERS', cpus().length.toString()),
  },
  loadBalancing: {
    enabled: getEnvVar('PERF_LOAD_BALANCING_ENABLED', 'false'),
    strategy: getEnvVar('PERF_LOAD_BALANCING_STRATEGY', 'round-robin'),
  },
  cdn: {
    enabled: getEnvVar('PERF_CDN_ENABLED', 'false'),
    provider: getEnvVar('PERF_CDN_PROVIDER', 'cloudflare'),
    domain: getEnvVar('PERF_CDN_DOMAIN', ''),
  },
});

// Validate the configuration
try {
  PerformanceConfigSchema.parse(performanceConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Performance configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid performance configuration');
  }
  throw error;
}

export default performanceConfig;
