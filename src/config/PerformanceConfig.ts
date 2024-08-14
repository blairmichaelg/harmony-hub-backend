// src/config/PerformanceConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for performance configuration
 * @remarks
 * This schema defines the structure and validation rules for the performance configuration.
 */
export const PerformanceConfigSchema = convict({
  maxHeapSize: {
    doc: 'Maximum heap size for the application',
    format: 'int',
    default: 2048,
    env: 'MAX_HEAP_SIZE',
  },
  maxEventLoopDelay: {
    doc: 'Maximum event loop delay in milliseconds',
    format: 'int',
    default: 1000,
    env: 'MAX_EVENT_LOOP_DELAY',
  },
  maxMemoryUsage: {
    doc: 'Maximum memory usage in MB',
    format: 'int',
    default: 1024,
    env: 'MAX_MEMORY_USAGE',
  },
  cdn: {
    doc: 'CDN configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether CDN is enabled'),
      domain: z.string().optional().describe('CDN domain'),
      // Add more CDN-specific fields as needed
    }),
    default: {
      enabled: false,
      domain: undefined,
    },
    env: 'CDN_CONFIG',
  },
  caching: {
    doc: 'Caching configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether caching is enabled'),
      ttl: z.number().int().positive().describe('Cache TTL in seconds'),
      // Add more caching-specific fields as needed
    }),
    default: {
      enabled: false,
      ttl: 3600,
    },
    env: 'CACHING_CONFIG',
  },
  // Add more performance-specific fields as needed
});

// Define the PerformanceConfig type based on the schema
export interface PerformanceConfig {
  maxHeapSize: number;
  maxEventLoopDelay: number;
  maxMemoryUsage: number;
  cdn: {
    enabled: boolean;
    domain?: string;
    // Add more CDN-specific fields as needed
  };
  caching: {
    enabled: boolean;
    ttl: number;
    // Add more caching-specific fields as needed
  };
  // Add more fields as needed for future extensibility
}

const config = PerformanceConfigSchema.getProperties();

export const performanceConfig: PerformanceConfig =
  config as unknown as PerformanceConfig;

// Validate the configuration
try {
  PerformanceConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Performance configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Performance configuration');
  }
  throw error;
}

export default performanceConfig;
