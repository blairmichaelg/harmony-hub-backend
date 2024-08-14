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

// Define the FeatureFlagsConfig type based on the schema
export interface FeatureFlagsConfig {
  flags: Record<string, boolean>;
  // Add more fields as needed for future extensibility
}

const config = FeatureFlagsConfigSchema.getProperties();

export const featureFlagsConfig: FeatureFlagsConfig =
  config as unknown as FeatureFlagsConfig;

// Validate the configuration
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
