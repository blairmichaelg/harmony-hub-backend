// src/config/FeatureFlagConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for feature flag configuration
 * @remarks
 * This schema defines the structure and validation rules for the feature flag configuration.
 */
export const FeatureFlagsConfigSchema = convict({
  flags: {
    doc: 'Feature flags and their states',
    format: z.record(z.string(), z.boolean()),
    default: {},
    env: 'FEATURE_FLAGS',
  },
  // Add more fields as needed for future extensibility
});

export type FeatureFlagsConfig = z.ZodType<any, any, any>;

const config = FeatureFlagsConfigSchema.getProperties();

export const featureFlagsConfig: FeatureFlagsConfig =
  config as unknown as FeatureFlagsConfig;

try {
  FeatureFlagsConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Feature Flag configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Feature Flag configuration');
  }
  throw error;
}

export default featureFlagsConfig;
