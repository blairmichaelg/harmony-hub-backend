// src/config/PerformanceConfig.ts

import convict from 'convict';

/**
 * Schema for performance configuration
 * @remarks
 * This schema defines the structure and validation rules for the performance configuration.
 */
const PerformanceConfigSchema = convict({
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
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for performance configuration
 */
export interface IPerformanceConfig {
  maxHeapSize: number;
  maxEventLoopDelay: number;
  maxMemoryUsage: number;
}

/**
 * Performance configuration object
 * @remarks
 * This object contains the parsed and validated performance configuration.
 */
const config = PerformanceConfigSchema.getProperties();

export const performanceConfig: IPerformanceConfig = config as unknown as IPerformanceConfig;

// Validate the configuration
try {
  PerformanceConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Performance configuration validation failed:', error.message);
    throw new Error('Invalid performance configuration');
  }
  throw error;
}

export default performanceConfig;
