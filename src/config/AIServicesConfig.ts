// src/config/AIServicesConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for AI services configuration
 * @remarks
 * This schema defines the structure and validation rules for the AI services configuration.
 */
export const AIServicesConfigSchema = convict({
  providers: {
    doc: 'AI service providers and their configurations',
    format: z.record(
      z.string(),
      z.object({
        apiKey: z.string().describe('API key for the service'),
        apiUrl: z.string().url().describe('API endpoint URL'),
        // Add more provider-specific fields as needed
      }),
    ),
    default: {},
    env: 'AI_SERVICE_PROVIDERS',
  },
  models: {
    doc: 'AI models and their versions',
    format: z.record(
      z.string(),
      z.object({
        version: z.string().describe('Model version'),
        // Add more model-specific fields as needed
      }),
    ),
    default: {},
    env: 'AI_MODELS',
  },
  // Add more fields as needed for future extensibility
});

export type AIServicesConfig = z.infer<typeof AIServicesConfigSchema>;

const config = AIServicesConfigSchema.getProperties();

export const aiServicesConfig: AIServicesConfig =
  config as unknown as AIServicesConfig;

// Validate the configuration
try {
  AIServicesConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'AI Services configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid AI Services configuration');
  }
  throw error;
}

export default aiServicesConfig;
