// src/config/AIServicesConfig.ts

import { z } from 'zod';

import { getEnvVariables } from './EnvironmentVariables';
import { parseJSON } from './utils';

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

const env = getEnvVariables();

const aiServicesConfig: AIServicesConfig = aiServicesConfigSchema.parse({
  defaultModel: env.AI_DEFAULT_MODEL,
  models: parseJSON(env.AI_MODELS, {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      version: '1.0',
      endpoint: env.GPT_35_TURBO_ENDPOINT,
      apiKey: env.GPT_35_TURBO_API_KEY,
      maxTokens: parseInt(env.GPT_35_TURBO_MAX_TOKENS, 10),
      temperature: parseFloat(env.GPT_35_TURBO_TEMPERATURE),
    },
    'gpt-4': {
      name: 'GPT-4',
      version: '1.0',
      endpoint: env.GPT_4_ENDPOINT,
      apiKey: env.GPT_4_API_KEY,
      maxTokens: parseInt(env.GPT_4_MAX_TOKENS, 10),
      temperature: parseFloat(env.GPT_4_TEMPERATURE),
    },
  }),
  jobQueue: {
    type: env.AI_JOB_QUEUE_TYPE,
    url: env.AI_JOB_QUEUE_URL,
    maxConcurrency: parseInt(env.AI_JOB_QUEUE_MAX_CONCURRENCY, 10),
    retryAttempts: parseInt(env.AI_JOB_QUEUE_RETRY_ATTEMPTS, 10),
    retryDelay: parseInt(env.AI_JOB_QUEUE_RETRY_DELAY, 10),
  },
  providers: {
    openai: env.OPENAI_API_KEY
      ? {
          apiKey: env.OPENAI_API_KEY,
          organization: env.OPENAI_ORGANIZATION,
          modelMapping: parseJSON(env.OPENAI_MODEL_MAPPING, {}),
        }
      : undefined,
    googleAI: env.GOOGLE_AI_API_KEY
      ? {
          apiKey: env.GOOGLE_AI_API_KEY,
          projectId: env.GOOGLE_AI_PROJECT_ID!,
          location: env.GOOGLE_AI_LOCATION,
        }
      : undefined,
    huggingface: env.HUGGINGFACE_API_KEY
      ? {
          apiKey: env.HUGGINGFACE_API_KEY,
          modelEndpoint: env.HUGGINGFACE_MODEL_ENDPOINT!,
        }
      : undefined,
  },
  fineTuning: {
    enabled: env.AI_FINE_TUNING_ENABLED === 'true',
    datasetPath: env.AI_FINE_TUNING_DATASET_PATH,
    epochs: parseInt(env.AI_FINE_TUNING_EPOCHS, 10),
    learningRate: parseFloat(env.AI_FINE_TUNING_LEARNING_RATE),
    batchSize: parseInt(env.AI_FINE_TUNING_BATCH_SIZE, 10),
    validationSplit: parseFloat(env.AI_FINE_TUNING_VALIDATION_SPLIT),
  },
  caching: {
    enabled: env.AI_CACHING_ENABLED === 'true',
    ttl: parseInt(env.AI_CACHING_TTL, 10),
    maxSize: parseInt(env.AI_CACHING_MAX_SIZE, 10),
  },
});

export { aiServicesConfig, AIServicesConfig };
