// PerformanceConfig.ts

import { cpus } from 'os';

import { z } from 'zod';

import { getEnvVariables } from '../utils/envUtils';

const cachingConfigSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['memory', 'redis']),
  ttl: z.number().int().nonnegative(),
  maxItems: z.number().int().positive(),
});

const compressionConfigSchema = z.object({
  enabled: z.boolean(),
  level: z.number().int().min(0).max(9),
  threshold: z.number().int().positive(),
});

const clusteringConfigSchema = z.object({
  enabled: z.boolean(),
  numWorkers: z.number().int().positive(),
});

const loadBalancingConfigSchema = z.object({
  enabled: z.boolean(),
  strategy: z.enum(['round-robin', 'least-connections', 'ip-hash']),
});

const cdnConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.string(),
  domain: z.string().url().optional(),
});

const performanceConfigSchema = z.object({
  caching: cachingConfigSchema,
  compression: compressionConfigSchema,
  clustering: clusteringConfigSchema,
  loadBalancing: loadBalancingConfigSchema,
  cdn: cdnConfigSchema,
});

type PerformanceConfig = z.infer<typeof performanceConfigSchema>;

const env = getEnvVariables();

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue;

const getCachingType = (type: string | undefined): 'memory' | 'redis' => {
  return type === 'memory' || type === 'redis' ? type : 'memory';
};

const getLoadBalancingStrategy = (
  strategy: string | undefined
): 'round-robin' | 'least-connections' | 'ip-hash' => {
  return strategy === 'round-robin' || strategy === 'least-connections' || strategy === 'ip-hash'
    ? strategy
    : 'round-robin';
};

const getNumWorkers = (numWorkersStr: string | undefined): number => {
  const parsedValue = parseInt(numWorkersStr || '0', 10);

  return parsedValue > 0 ? parsedValue : cpus().length;
};

const performanceConfig: PerformanceConfig = performanceConfigSchema.parse({
  caching: {
    enabled: parseBoolean(env.PERF_CACHING_ENABLED, true),
    type: getCachingType(env.PERF_CACHING_TYPE),
    ttl: parseInt(env.PERF_CACHING_TTL || '3600', 10), // 1 hour
    maxItems: parseInt(env.PERF_CACHING_MAX_ITEMS || '1000', 10),
  },
  compression: {
    enabled: parseBoolean(env.PERF_COMPRESSION_ENABLED, true),
    level: parseInt(env.PERF_COMPRESSION_LEVEL || '6', 10),
    threshold: parseInt(env.PERF_COMPRESSION_THRESHOLD || '1024', 10), // 1KB
  },
  clustering: {
    enabled: parseBoolean(env.PERF_CLUSTERING_ENABLED, false),
    numWorkers: getNumWorkers(env.PERF_CLUSTERING_NUM_WORKERS),
  },
  loadBalancing: {
    enabled: parseBoolean(env.PERF_LOAD_BALANCING_ENABLED, false),
    strategy: getLoadBalancingStrategy(env.PERF_LOAD_BALANCING_STRATEGY),
  },
  cdn: {
    enabled: parseBoolean(env.PERF_CDN_ENABLED, false),
    provider: env.PERF_CDN_PROVIDER || 'cloudflare',
    domain: env.PERF_CDN_DOMAIN,
  },
});

export { performanceConfig, PerformanceConfig };
