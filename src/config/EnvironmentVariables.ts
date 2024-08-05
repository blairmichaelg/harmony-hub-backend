// src/config/EnvironmentVariables.ts

import { z } from 'zod';

export const EnvironmentVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  AI_DEFAULT_MODEL: z.string().default('gpt-3.5-turbo'),
  AI_MODELS: z.string().default('{}'),
  GPT_35_TURBO_ENDPOINT: z.string().url().default('https://api.openai.com/v1/chat/completions'),
  GPT_35_TURBO_API_KEY: z.string(),
  GPT_35_TURBO_MAX_TOKENS: z.string().default('4096'),
  GPT_35_TURBO_TEMPERATURE: z.string().default('0.7'),
  GPT_4_ENDPOINT: z.string().url().default('https://api.openai.com/v1/chat/completions'),
  GPT_4_API_KEY: z.string(),
  GPT_4_MAX_TOKENS: z.string().default('8192'),
  GPT_4_TEMPERATURE: z.string().default('0.7'),
  AI_JOB_QUEUE_TYPE: z.enum(['redis', 'rabbitmq', 'sqs']).default('redis'),
  AI_JOB_QUEUE_URL: z.string().url().default('redis://localhost:6379'),
  AI_JOB_QUEUE_MAX_CONCURRENCY: z.string().default('5'),
  AI_JOB_QUEUE_RETRY_ATTEMPTS: z.string().default('3'),
  AI_JOB_QUEUE_RETRY_DELAY: z.string().default('1000'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_ORGANIZATION: z.string().optional(),
  OPENAI_MODEL_MAPPING: z.string().default('{}'),
  GOOGLE_AI_API_KEY: z.string().optional(),
  GOOGLE_AI_PROJECT_ID: z.string().optional(),
  GOOGLE_AI_LOCATION: z.string().default('us-central1'),
  HUGGINGFACE_API_KEY: z.string().optional(),
  HUGGINGFACE_MODEL_ENDPOINT: z.string().url().optional(),
  AI_FINE_TUNING_ENABLED: z.string().default('false'),
  AI_FINE_TUNING_DATASET_PATH: z.string().default('./datasets/fine_tuning'),
  AI_FINE_TUNING_EPOCHS: z.string().default('3'),
  AI_FINE_TUNING_LEARNING_RATE: z.string().default('0.00002'),
  AI_FINE_TUNING_BATCH_SIZE: z.string().default('32'),
  AI_FINE_TUNING_VALIDATION_SPLIT: z.string().default('0.2'),
  AI_CACHING_ENABLED: z.string().default('true'),
  AI_CACHING_TTL: z.string().default('3600'),
  AI_CACHING_MAX_SIZE: z.string().default('1000'),
  // Add other environment variables here
});

export type EnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;

export const getEnvVariables = (): EnvironmentVariables => {
  return EnvironmentVariablesSchema.parse(process.env);
};
