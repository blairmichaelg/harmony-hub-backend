// src/config/RateLimitConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for rate limiting configuration
 * @remarks
 * This schema defines the structure and validation rules for the rate limiting configuration.
 */
export const RateLimitConfigSchema = convict({
  windowMs: {
    doc: 'Time window in milliseconds',
    format: z.number().int().positive().describe('Time window in milliseconds'),
    default: 60000,
    env: 'RATE_LIMIT_WINDOW_MS',
  },
  maxRequests: {
    doc: 'Maximum number of requests per windowMs',
    format: z
      .number()
      .int()
      .positive()
      .describe('Maximum number of requests per windowMs'),
    default: 100,
    env: 'RATE_LIMIT_MAX_REQUESTS',
  },
  // Add more fields as needed for future extensibility
});

export type RateLimitConfig = z.ZodType<any, any, any>;

const config = RateLimitConfigSchema.getProperties();

export const rateLimitConfig: RateLimitConfig =
  config as unknown as RateLimitConfig;

// Validate the configuration
try {
  RateLimitConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Rate limiting configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid rate limiting configuration');
  }
  throw error;
}

export default rateLimitConfig;
