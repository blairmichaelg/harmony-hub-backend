// AIServicesConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from './utils';

const aiModelSchema = z.object({
  name: z.string(),
  version: z.string(),
  endpoint: z.string().url(),
  apiKey: z.string(),
  maxTokens: z.number().int().positive(),
  temperature: z.number().min(0).max(1),
});

const aiServicesConfigSchema = z.object({
  defaultModel: z.string(),
  models: z.record(aiModelSchema),
  jobQueue: z.object({
    type: z.enum(['redis', 'rabbitmq', 'sqs']),
    url: z.string().url(),
    maxConcurrency: z.number().int().positive(),
    retryAttempts: z.number().int().nonnegative(),
    retryDelay: z.number().int().nonnegative(),
  }),
  providers: z.object({
    openai: z
      .object({
        apiKey: z.string(),
        organization: z.string().optional(),
        modelMapping: z.record(z.string()).optional(),
      })
      .optional(),
    googleAI: z
      .object({
        apiKey: z.string(),
        projectId: z.string(),
        location: z.string().optional(),
      })
      .optional(),
    huggingface: z
      .object({
        apiKey: z.string(),
        modelEndpoint: z.string().url(),
      })
      .optional(),
  }),
  fineTuning: z.object({
    enabled: z.boolean(),
    datasetPath: z.string(),
    epochs: z.number().int().positive(),
    learningRate: z.number().positive(),
    batchSize: z.number().int().positive(),
    validationSplit: z.number().min(0).max(1),
  }),
  caching: z.object({
    enabled: z.boolean(),
    ttl: z.number().int().nonnegative(),
    maxSize: z.number().int().positive(),
  }),
});

type AIServicesConfig = z.infer<typeof aiServicesConfigSchema>;

const aiServicesConfig: AIServicesConfig = aiServicesConfigSchema.parse({
  defaultModel: getEnvVar('AI_DEFAULT_MODEL', 'gpt-3.5-turbo'),
  models: parseJSON(getEnvVar('AI_MODELS', '{}'), {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      version: '1.0',
      endpoint: getEnvVar('GPT_35_TURBO_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      apiKey: getEnvVar('GPT_35_TURBO_API_KEY'),
      maxTokens: parseInt(getEnvVar('GPT_35_TURBO_MAX_TOKENS', '4096'), 10),
      temperature: parseFloat(getEnvVar('GPT_35_TURBO_TEMPERATURE', '0.7')),
    },
    'gpt-4': {
      name: 'GPT-4',
      version: '1.0',
      endpoint: getEnvVar('GPT_4_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      apiKey: getEnvVar('GPT_4_API_KEY'),
      maxTokens: parseInt(getEnvVar('GPT_4_MAX_TOKENS', '8192'), 10),
      temperature: parseFloat(getEnvVar('GPT_4_TEMPERATURE', '0.7')),
    },
  }),
  jobQueue: {
    type: getEnvVar('AI_JOB_QUEUE_TYPE', 'redis') as 'redis' | 'rabbitmq' | 'sqs',
    url: getEnvVar('AI_JOB_QUEUE_URL', 'redis://localhost:6379'),
    maxConcurrency: parseInt(getEnvVar('AI_JOB_QUEUE_MAX_CONCURRENCY', '5'), 10),
    retryAttempts: parseInt(getEnvVar('AI_JOB_QUEUE_RETRY_ATTEMPTS', '3'), 10),
    retryDelay: parseInt(getEnvVar('AI_JOB_QUEUE_RETRY_DELAY', '1000'), 10),
  },
  providers: {
    openai: getEnvVar('OPENAI_API_KEY')
      ? {
          apiKey: getEnvVar('OPENAI_API_KEY'),
          organization: getEnvVar('OPENAI_ORGANIZATION'),
          modelMapping: parseJSON(getEnvVar('OPENAI_MODEL_MAPPING', '{}')),
        }
      : undefined,
    googleAI: getEnvVar('GOOGLE_AI_API_KEY')
      ? {
          apiKey: getEnvVar('GOOGLE_AI_API_KEY'),
          projectId: getEnvVar('GOOGLE_AI_PROJECT_ID'),
          location: getEnvVar('GOOGLE_AI_LOCATION', 'us-central1'),
        }
      : undefined,
    huggingface: getEnvVar('HUGGINGFACE_API_KEY')
      ? {
          apiKey: getEnvVar('HUGGINGFACE_API_KEY'),
          modelEndpoint: getEnvVar('HUGGINGFACE_MODEL_ENDPOINT'),
        }
      : undefined,
  },
  fineTuning: {
    enabled: getEnvVar('AI_FINE_TUNING_ENABLED', 'false') === 'true',
    datasetPath: getEnvVar('AI_FINE_TUNING_DATASET_PATH', './datasets/fine_tuning'),
    epochs: parseInt(getEnvVar('AI_FINE_TUNING_EPOCHS', '3'), 10),
    learningRate: parseFloat(getEnvVar('AI_FINE_TUNING_LEARNING_RATE', '0.00002')),
    batchSize: parseInt(getEnvVar('AI_FINE_TUNING_BATCH_SIZE', '32'), 10),
    validationSplit: parseFloat(getEnvVar('AI_FINE_TUNING_VALIDATION_SPLIT', '0.2')),
  },
  caching: {
    enabled: getEnvVar('AI_CACHING_ENABLED', 'true') === 'true',
    ttl: parseInt(getEnvVar('AI_CACHING_TTL', '3600'), 10),
    maxSize: parseInt(getEnvVar('AI_CACHING_MAX_SIZE', '1000'), 10),
  },
});

export { aiServicesConfig, AIServicesConfig };
