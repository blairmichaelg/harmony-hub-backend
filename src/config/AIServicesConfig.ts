// src/config/AIServicesConfig.ts

import convict from 'convict';
import * as z from 'zod';

/**
 * Zod schema for AI services configuration
 */
const ZodAIServicesConfigSchema = z.object({
  providers: z.record(
    z.string(),
    z.object({
      apiKey: z.string().describe('API key for the service'),
      apiUrl: z.string().url().describe('API endpoint URL for the service'),
    }),
  ),
  defaultProvider: z.string().describe('Default AI service provider'),
  timeout: z
    .number()
    .int()
    .positive()
    .describe('Request timeout in milliseconds'),
});

export const AIServicesConfigSchema = convict({
  providers: {
    doc: 'AI service providers configuration',
    format: ZodAIServicesConfigSchema.shape.providers,
    default: {
      openai: {
        apiKey: 'your-openai-api-key',
        apiUrl: 'https://api.openai.com/v1',
      },
      azure: {
        apiKey: 'your-azure-api-key',
        apiUrl: 'https://api.cognitive.microsoft.com',
      },
    },
    env: 'AI_PROVIDERS',
  },
  defaultProvider: {
    doc: 'Default AI service provider',
    format: 'string',
    default: 'openai',
    env: 'AI_DEFAULT_PROVIDER',
  },
  timeout: {
    doc: 'Request timeout in milliseconds',
    format: 'nat',
    default: 5000,
    env: 'AI_TIMEOUT',
  },
});

export type AIServicesConfig = z.infer<typeof ZodAIServicesConfigSchema>;

// Create and validate the configuration object
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
