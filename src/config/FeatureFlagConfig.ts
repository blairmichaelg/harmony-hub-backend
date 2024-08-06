// src/config/FeatureFlagConfig.ts

import { config } from 'dotenv';
import * as joi from 'joi';

config();

interface IFeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userSegments?: string[];
}

interface IABTest {
  name: string;
  variants: string[];
  distribution: number[];
}

export interface IFeatureFlagConfig {
  featureFlags: IFeatureFlag[];
  abTests: IABTest[];
}

const featureFlagSchema = joi.object({
  name: joi.string().required(),
  enabled: joi.boolean().required(),
  rolloutPercentage: joi.number().min(0).max(100).optional(),
  userSegments: joi.array().items(joi.string()).optional(),
});

const abTestSchema = joi.object({
  name: joi.string().required(),
  variants: joi.array().items(joi.string()).min(2).required(),
  distribution: joi.array().items(joi.number().min(0).max(100)).required(),
});

const featureFlagConfigSchema = joi.object({
  featureFlags: joi.array().items(featureFlagSchema).required(),
  abTests: joi.array().items(abTestSchema).required(),
});

const featureFlagConfig: IFeatureFlagConfig = {
  featureFlags: [
    {
      name: 'advancedAudioProcessing',
      enabled: process.env.FEATURE_ADVANCED_AUDIO_PROCESSING === 'true',
      rolloutPercentage: 50,
    },
    {
      name: 'collaborativeEditing',
      enabled: process.env.FEATURE_COLLABORATIVE_EDITING === 'true',
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
};

const { error } = featureFlagConfigSchema.validate(featureFlagConfig);

if (error) {
  throw new Error(`Feature Flag Configuration Error: ${error.message}`);
}

export default featureFlagConfig;
