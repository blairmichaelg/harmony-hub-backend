// src/config/FeatureFlagConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

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
export const FeatureFlagConfigSchema = z.object({
  featureFlags: z.array(FeatureFlagSchema).describe('List of feature flags'),
  abTests: z.array(ABTestSchema).describe('List of A/B tests'),
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
export const featureFlagConfig: FeatureFlagConfig = FeatureFlagConfigSchema.parse({
  featureFlags: [
    {
      name: 'advancedAudioProcessing',
      enabled: getEnvVar('FEATURE_ADVANCED_AUDIO_PROCESSING', 'false'),
      rolloutPercentage: 50,
    },
    {
      name: 'collaborativeEditing',
      enabled: getEnvVar('FEATURE_COLLABORATIVE_EDITING', 'false'),
      userSegments: ['premium', 'beta'],
    },
  ],
  abTests: [
    {
      name: 'newUserInterface',
      variants: ['control', 'variantA', 'variantB'],
      distribution: [33, 33, 34],
    },
  ],
});

// Validate the configuration
try {
  FeatureFlagConfigSchema.parse(featureFlagConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Feature flag configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid feature flag configuration');
  }
  throw error;
}

export default featureFlagConfig;
