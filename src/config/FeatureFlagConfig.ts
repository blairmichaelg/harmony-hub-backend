// src/config/FeatureFlagConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for individual feature flag
 */
z.object({
  name: z.string().describe('Name of the feature flag'),
  enabled: z.coerce.boolean().default(false).describe('Whether the feature flag is enabled'),
  rolloutPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(0)
    .describe('Percentage of users for whom the feature is enabled'),
});

/**
 * Schema for feature flags configuration
 * @remarks
 * This schema defines the structure and validation rules for the feature flags configuration.
 */
const FeatureFlagsConfigSchema = convict({
  featureFlags: {
    doc: 'List of feature flags',
    format: Array,
    default: [],
    env: 'FEATURE_FLAGS',
  },
});

/**
 * Interface definition for individual feature flag
 */
export interface IFeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
}

/**
 * Interface definition for feature flags configuration
 */
export interface IFeatureFlagsConfig {
  featureFlags: IFeatureFlag[];
}

/**
 * Feature flags configuration object
 * @remarks
 * This object contains the parsed and validated feature flags configuration.
 */
const config = FeatureFlagsConfigSchema.getProperties();

export const featureFlagsConfig: IFeatureFlagsConfig = config as unknown as IFeatureFlagsConfig;

// Validate the configuration
try {
  FeatureFlagsConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Feature flags configuration validation failed:', error.message);
    throw new Error('Invalid feature flags configuration');
  }
  throw error;
}

export default featureFlagsConfig;
