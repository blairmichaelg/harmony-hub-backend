// src/config/FeatureFlagConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for individual feature flag
 */
const FeatureFlagSchema = z.object({
  name: z.string().describe('Name of the feature flag'),
  enabled: z.coerce.boolean().default(false).describe('Whether the feature flag is enabled'),
  rolloutPercentage: z.coerce
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Percentage of users for gradual rollout'),
  userSegments: z.array(z.string()).optional().describe('User segments for targeted rollout'),
});

/**
 * Schema for A/B test
 */
const ABTestSchema = z
  .object({
    name: z.string().describe('Name of the A/B test'),
    variants: z.array(z.string()).min(2).describe('Variants for the A/B test'),
    distribution: z
      .array(z.coerce.number().min(0).max(100))
      .describe('Distribution percentages for variants'),
  })
  .refine((data) => data.variants.length === data.distribution.length, {
    message: 'Number of variants must match the number of distribution percentages',
  })
  .refine((data) => data.distribution.reduce((sum, value) => sum + value, 0) === 100, {
    message: 'Distribution percentages must sum to 100',
  });

/**
 * Schema for feature flag configuration
 * @remarks
 * This schema defines the structure and validation rules for the feature flag configuration.
 */
const FeatureFlagConfigSchema = convict({
  featureFlags: {
    doc: 'List of feature flags',
    format: z.array(FeatureFlagSchema),
    default: [
      {
        name: 'advancedAudioProcessing',
        enabled: false,
        rolloutPercentage: 50,
      },
      {
        name: 'collaborativeEditing',
        enabled: false,
        userSegments: ['premium', 'beta'],
      },
    ],
    env: 'FEATURE_FLAGS',
  },
  abTests: {
    doc: 'List of A/B tests',
    format: z.array(ABTestSchema),
    default: [
      {
        name: 'newUserInterface',
        variants: ['control', 'variantA', 'variantB'],
        distribution: [33, 33, 34],
      },
    ],
    env: 'AB_TESTS',
  },
});

/**
 * Type definitions
 */
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type ABTest = z.infer<typeof ABTestSchema>;
export type FeatureFlagConfig = z.infer<typeof FeatureFlagConfigSchema>;

/**
 * Feature flag configuration object
 * @remarks
 * This object contains the parsed and validated feature flag configuration.
 */
export const featureFlagConfig = FeatureFlagConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  FeatureFlagConfigSchema.validate(featureFlagConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Feature flag configuration validation failed:', error.message);
    throw new Error('Invalid feature flag configuration');
  }
  throw error;
}

export default featureFlagConfig;
