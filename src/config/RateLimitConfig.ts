// src/config/RateLimitConfig.ts

import convict from 'convict';

/**
 * Schema for rate limiting configuration
 * @remarks
 * This schema defines the structure and validation rules for the rate limiting configuration.
 */
const RateLimitConfigSchema = convict({
  windowMs: {
    doc: 'Time window in milliseconds',
    format: 'int',
    default: 60000,
    env: 'RATE_LIMIT_WINDOW_MS',
  },
  maxRequests: {
    doc: 'Maximum number of requests per windowMs',
    format: 'int',
    default: 100,
    env: 'RATE_LIMIT_MAX_REQUESTS',
  },
  // Add more fields as needed for future extensibility
});

/**
 * Interface definition for rate limiting configuration
 */
export interface IRateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Rate limiting configuration object
 * @remarks
 * This object contains the parsed and validated rate limiting configuration.
 */
const config = RateLimitConfigSchema.getProperties();

export const rateLimitConfig: IRateLimitConfig = config as unknown as IRateLimitConfig;

// Validate the configuration
try {
  RateLimitConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Rate limiting configuration validation failed:', error.message);
    throw new Error('Invalid rate limiting configuration');
  }
  throw error;
}

export default rateLimitConfig;
