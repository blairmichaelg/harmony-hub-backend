// AIServicesConfig.ts

import { z } from 'zod';

import { getEnvVariables } from '../utils/envUtils';
import { parseJSON } from '../utils/jsonUtils';

const aiModelSchema = z.object({
  name: z.string(),
  version: z.string(),
  endpoint: z.string().url(),
  apiKey: z.string(),
  maxTokens: z.number().int().positive(),
  temperature: z.number().min(0).max(1),
});

const jobQueueSchema = z.object({
  type: z.enum(['redis', 'rabbitmq', 'sqs']),
  url: z.string().url(),
  maxConcurrency: z.number().int().positive(),
  retryAttempts: z.number().int().nonnegative(),
  retryDelay: z.number().int().nonnegative(),
});

const providerSchema = z.object({
  apiKey: z.string(),
  organization: z.string().optional(),
  modelMapping: z.record(z.string()).optional(),
});

const fineTuningSchema = z.object({
  enabled: z.boolean(),
  datasetPath: z.string(),
  epochs: z.number().int().positive(),
  learningRate: z.number().positive(),
  batchSize: z.number().int().positive(),
  validationSplit: z.number().min(0).max(1),
});

const cachingSchema = z.object({
  enabled: z.boolean(),
  ttl: z.number().int().nonnegative(),
  maxSize: z.number().int().positive(),
});

const aiServicesConfigSchema = z.object({
  defaultModel: z.string(),
  models: z.record(aiModelSchema),
  jobQueue: jobQueueSchema,
  providers: z.object({
    openai: providerSchema.optional(),
    googleAI: providerSchema
      .extend({
        projectId: z.string(),
        location: z.string().optional(),
      })
      .optional(),
    huggingface: providerSchema
      .extend({
        modelEndpoint: z.string().url(),
      })
      .optional(),
  }),
  fineTuning: fineTuningSchema,
  caching: cachingSchema,
});

type AIServicesConfig = z.infer<typeof aiServicesConfigSchema>;

const env = getEnvVariables();

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue;

const getJobQueueType = (type: string | undefined): 'redis' | 'rabbitmq' | 'sqs' => {
  if (type === 'redis' || type === 'rabbitmq' || type === 'sqs') {
    return type;
  }

  return 'redis';
};

const aiServicesConfig: AIServicesConfig = aiServicesConfigSchema.parse({
  defaultModel: env.AI_DEFAULT_MODEL || 'gpt-3.5-turbo',
  models: parseJSON(env.AI_MODELS, {
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      version: '1.0',
      endpoint: env.GPT_35_TURBO_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
      apiKey: env.GPT_35_TURBO_API_KEY || '',
      maxTokens: parseInt(env.GPT_35_TURBO_MAX_TOKENS || '2048', 10),
      temperature: parseFloat(env.GPT_35_TURBO_TEMPERATURE || '0.7'),
    },
  }),
  jobQueue: {
    type: getJobQueueType(env.AI_JOB_QUEUE_TYPE),
    url: env.AI_JOB_QUEUE_URL || 'redis://localhost:6379',
    maxConcurrency: parseInt(env.AI_JOB_QUEUE_MAX_CONCURRENCY || '5', 10),
    retryAttempts: parseInt(env.AI_JOB_QUEUE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(env.AI_JOB_QUEUE_RETRY_DELAY || '1000', 10),
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
          projectId: env.GOOGLE_AI_PROJECT_ID || '',
          location: env.GOOGLE_AI_LOCATION,
          modelMapping: parseJSON(env.GOOGLE_AI_MODEL_MAPPING, {}),
        }
      : undefined,
    huggingface: env.HUGGINGFACE_API_KEY
      ? {
          apiKey: env.HUGGINGFACE_API_KEY,
          modelEndpoint:
            env.HUGGINGFACE_MODEL_ENDPOINT || 'https://api-inference.huggingface.co/models/gpt2',
          modelMapping: parseJSON(env.HUGGINGFACE_MODEL_MAPPING, {}),
        }
      : undefined,
  },
  fineTuning: {
    enabled: parseBoolean(env.AI_FINE_TUNING_ENABLED, false),
    datasetPath: env.AI_FINE_TUNING_DATASET_PATH || './data/fine-tuning',
    epochs: parseInt(env.AI_FINE_TUNING_EPOCHS || '3', 10),
    learningRate: parseFloat(env.AI_FINE_TUNING_LEARNING_RATE || '0.00002'),
    batchSize: parseInt(env.AI_FINE_TUNING_BATCH_SIZE || '4', 10),
    validationSplit: parseFloat(env.AI_FINE_TUNING_VALIDATION_SPLIT || '0.2'),
  },
  caching: {
    enabled: parseBoolean(env.AI_CACHING_ENABLED, true),
    ttl: parseInt(env.AI_CACHING_TTL || '3600', 10), // 1 hour
    maxSize: parseInt(env.AI_CACHING_MAX_SIZE || '1000', 10), // 1000 items
  },
});

export { aiServicesConfig, AIServicesConfig };
