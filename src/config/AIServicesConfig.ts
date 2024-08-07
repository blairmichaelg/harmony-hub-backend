// src/config/AIServicesConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

/**
 * Schema for AI model configuration
 */
const AIModelSchema = z.object({
  name: z.string().nonempty().describe('Model name'),
  version: z.string().nonempty().describe('Model version'),
  endpoint: z.string().url().describe('Model API endpoint URL'),
  apiKey: z.string().nonempty().describe('API key for the model'),
  maxTokens: z.coerce.number().int().positive().describe('Maximum number of tokens'),
  temperature: z.coerce.number().min(0).max(1).describe('Temperature for text generation'),
});

/**
 * Schema for job queue configuration
 */
const JobQueueSchema = z.object({
  type: z.enum(['redis', 'rabbitmq', 'sqs']).describe('Type of job queue'),
  url: z.string().url().describe('Job queue URL'),
  maxConcurrency: z.coerce.number().int().positive().describe('Maximum concurrent jobs'),
  retryAttempts: z.coerce.number().int().nonnegative().describe('Number of retry attempts'),
  retryDelay: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe('Delay between retries in milliseconds'),
});

/**
 * Schema for AI provider configuration
 */
const ProviderSchema = z.object({
  apiKey: z.string().nonempty().describe('API key for the provider'),
  organization: z.string().optional().describe('Organization ID (if applicable)'),
  modelMapping: z
    .record(z.string())
    .optional()
    .describe('Mapping of model names to provider-specific names'),
});

/**
 * Schema for fine-tuning configuration
 */
const FineTuningSchema = z
  .object({
    enabled: z.coerce.boolean().describe('Whether fine-tuning is enabled'),
    datasetPath: z.string().nonempty().describe('Path to the fine-tuning dataset'),
    epochs: z.coerce.number().int().positive().describe('Number of training epochs'),
    learningRate: z.coerce.number().positive().describe('Learning rate for training'),
    batchSize: z.coerce.number().int().positive().describe('Batch size for training'),
    validationSplit: z.coerce
      .number()
      .min(0)
      .max(1)
      .describe('Fraction of data to use for validation'),
  })
  .refine((data) => !data.enabled || data.datasetPath.trim() !== '', {
    message: 'Dataset path is required when fine-tuning is enabled',
    path: ['datasetPath'],
  });

/**
 * Schema for caching configuration
 */
const CachingSchema = z.object({
  enabled: z.coerce.boolean().describe('Whether caching is enabled'),
  ttl: z.coerce.number().int().nonnegative().describe('Time-to-live for cached items in seconds'),
  maxSize: z.coerce.number().int().positive().describe('Maximum number of items in the cache'),
});

/**
 * Schema for AI services configuration
 */
export const AIServicesConfigSchema = z
  .object({
    defaultModel: z.string().nonempty().describe('Default AI model to use'),
    models: z.record(AIModelSchema).describe('Available AI models'),
    jobQueue: JobQueueSchema.describe('Job queue configuration'),
    providers: z
      .object({
        openai: ProviderSchema.optional().describe('OpenAI provider configuration'),
        googleAI: ProviderSchema.extend({
          projectId: z.string().nonempty().describe('Google Cloud project ID'),
          location: z.string().optional().describe('Google Cloud location'),
        })
          .optional()
          .describe('Google AI provider configuration'),
        huggingface: ProviderSchema.extend({
          modelEndpoint: z.string().url().describe('Hugging Face model endpoint URL'),
        })
          .optional()
          .describe('Hugging Face provider configuration'),
      })
      .describe('AI provider configurations'),
    fineTuning: FineTuningSchema.describe('Fine-tuning configuration'),
    caching: CachingSchema.describe('Caching configuration'),
  })
  .refine((data) => data.defaultModel in data.models, {
    message: 'Default model must be defined in the models object',
    path: ['defaultModel'],
  });

/**
 * Type definition for AI services configuration
 */
export type AIServicesConfig = z.infer<typeof AIServicesConfigSchema>;

/**
 * AI services configuration object
 * @remarks
 * This object contains the parsed and validated AI services configuration.
 */
export const aiServicesConfig: AIServicesConfig = AIServicesConfigSchema.parse({
  defaultModel: getEnvVar('AI_DEFAULT_MODEL', 'gpt-3.5-turbo'),
  models: parseJSON(getEnvVar('AI_MODELS', '{}'), {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      version: '1.0',
      endpoint: getEnvVar('GPT_35_TURBO_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      apiKey: getEnvVar('GPT_35_TURBO_API_KEY', ''),
      maxTokens: getEnvVar('GPT_35_TURBO_MAX_TOKENS', '2048'),
      temperature: getEnvVar('GPT_35_TURBO_TEMPERATURE', '0.7'),
    },
    'gpt-4': {
      name: 'GPT-4',
      version: '1.0',
      endpoint: getEnvVar('GPT_4_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      apiKey: getEnvVar('GPT_4_API_KEY', ''),
      maxTokens: getEnvVar('GPT_4_MAX_TOKENS', '8192'),
      temperature: getEnvVar('GPT_4_TEMPERATURE', '0.7'),
    },
  }),
  jobQueue: {
    type: getEnvVar('AI_JOB_QUEUE_TYPE', 'redis') as 'redis' | 'rabbitmq' | 'sqs',
    url: getEnvVar('AI_JOB_QUEUE_URL', 'redis://localhost:6379'),
    maxConcurrency: getEnvVar('AI_JOB_QUEUE_MAX_CONCURRENCY', '5'),
    retryAttempts: getEnvVar('AI_JOB_QUEUE_RETRY_ATTEMPTS', '3'),
    retryDelay: getEnvVar('AI_JOB_QUEUE_RETRY_DELAY', '1000'),
  },
  providers: {
    openai: {
      apiKey: getEnvVar('OPENAI_API_KEY', ''),
      organization: getEnvVar('OPENAI_ORGANIZATION', ''),
    },
    googleAI: {
      apiKey: getEnvVar('GOOGLE_AI_API_KEY', ''),
      projectId: getEnvVar('GOOGLE_CLOUD_PROJECT_ID', ''),
      location: getEnvVar('GOOGLE_CLOUD_LOCATION', 'us-central1'),
    },
    huggingface: {
      apiKey: getEnvVar('HUGGINGFACE_API_KEY', ''),
      modelEndpoint: getEnvVar(
        'HUGGINGFACE_MODEL_ENDPOINT',
        'https://api-inference.huggingface.co/models/gpt2'
      ),
    },
  },
  fineTuning: {
    enabled: getEnvVar('AI_FINE_TUNING_ENABLED', 'false'),
    datasetPath: getEnvVar('AI_FINE_TUNING_DATASET_PATH', ''),
    epochs: getEnvVar('AI_FINE_TUNING_EPOCHS', '3'),
    learningRate: getEnvVar('AI_FINE_TUNING_LEARNING_RATE', '0.00002'),
    batchSize: getEnvVar('AI_FINE_TUNING_BATCH_SIZE', '4'),
    validationSplit: getEnvVar('AI_FINE_TUNING_VALIDATION_SPLIT', '0.2'),
  },
  caching: {
    enabled: getEnvVar('AI_CACHING_ENABLED', 'true'),
    ttl: getEnvVar('AI_CACHING_TTL', '3600'),
    maxSize: getEnvVar('AI_CACHING_MAX_SIZE', '1000'),
  },
});

// Validate the configuration
try {
  AIServicesConfigSchema.parse(aiServicesConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('AI services configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid AI services configuration');
  }
  throw error;
}
