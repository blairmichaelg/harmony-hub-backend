// src/config/AIServicesConfig.ts

import { z } from 'zod';

// Define the configuration schema using Zod
const AIModelSchema = z.object({
  name: z.string().nonempty().describe('Model name for HarmonyHub'),
  version: z.string().nonempty().describe('Model version for HarmonyHub'),
  endpoint: z.string().url().describe('Model API endpoint URL for HarmonyHub'),
  apiKey: z.string().nonempty().describe('API key for the model specific to HarmonyHub'),
  maxTokens: z.coerce.number().int().positive().describe('Maximum number of tokens for HarmonyHub'),
  temperature: z.coerce
    .number()
    .min(0)
    .max(1)
    .describe('Temperature for text generation in HarmonyHub'),
});

const AIServicesConfigSchema = z.object({
  defaultModel: z.string().describe('Default AI model to use in HarmonyHub'),
  models: z.record(AIModelSchema).describe('Available AI models for HarmonyHub'),
  realTime: z.object({
    transcription: z.object({
      enabled: z.boolean().describe('Whether real-time transcription is enabled in HarmonyHub'),
      model: z
        .string()
        .describe('Name of the AI model to use for real-time transcription in HarmonyHub'),
    }),
    generation: z.object({
      enabled: z.boolean().describe('Whether real-time audio generation is enabled in HarmonyHub'),
      model: z
        .string()
        .describe('Name of the AI model to use for real-time audio generation in HarmonyHub'),
    }),
  }),
  collaborationFeatures: z.object({
    smartTrackSeparation: z.object({
      enabled: z
        .boolean()
        .describe('Whether AI-powered smart track separation is enabled in HarmonyHub'),
      model: z
        .string()
        .describe('Name of the AI model to use for smart track separation in HarmonyHub'),
    }),
    automaticHarmonyGeneration: z.object({
      enabled: z
        .boolean()
        .describe('Whether automatic harmony generation is enabled in HarmonyHub'),
      model: z
        .string()
        .describe('Name of the AI model to use for automatic harmony generation in HarmonyHub'),
    }),
    aiAssistedComposition: z.object({
      enabled: z.boolean().describe('Whether AI-assisted composition is enabled in HarmonyHub'),
      model: z
        .string()
        .describe('Name of the AI model to use for AI-assisted composition in HarmonyHub'),
    }),
  }),
  caching: z.object({
    enabled: z.boolean().describe('Whether caching is enabled in HarmonyHub'),
    ttl: z.coerce
      .number()
      .int()
      .positive()
      .describe('Time-to-live for cached items in seconds for HarmonyHub'),
    maxSize: z.coerce
      .number()
      .int()
      .positive()
      .describe('Maximum number of items in the cache for HarmonyHub'),
  }),
  jobQueue: z.object({
    type: z.enum(['redis', 'rabbitmq', 'sqs']).describe('Type of job queue for HarmonyHub'),
    url: z.string().url().describe('Job queue URL for HarmonyHub'),
    maxConcurrency: z.coerce
      .number()
      .int()
      .positive()
      .describe('Maximum concurrent jobs for HarmonyHub'),
    retryAttempts: z.coerce
      .number()
      .int()
      .positive()
      .describe('Number of retry attempts for HarmonyHub'),
    retryDelay: z.coerce
      .number()
      .int()
      .positive()
      .describe('Delay between retries in milliseconds for HarmonyHub'),
  }),
  providers: z.object({
    harmonyOpenAI: z.object({
      apiKey: z.string().nonempty().describe('API key for HarmonyHub OpenAI'),
      organization: z
        .string()
        .optional()
        .describe('Organization ID for HarmonyHub OpenAI (optional)'),
    }),
    harmonyGoogleAI: z.object({
      apiKey: z.string().nonempty().describe('API key for HarmonyHub Google AI'),
      projectId: z.string().nonempty().describe('Google Cloud project ID for HarmonyHub'),
      location: z.string().default('us-central1').describe('Google Cloud location for HarmonyHub'),
    }),
    harmonyHuggingFace: z.object({
      apiKey: z.string().nonempty().describe('API key for HarmonyHub Hugging Face'),
      modelEndpoint: z.string().url().describe('Hugging Face model endpoint URL for HarmonyHub'),
    }),
  }),
});

export type AIServicesConfig = z.infer<typeof AIServicesConfigSchema>;

// Create and validate the configuration object
export const aiServicesConfig = AIServicesConfigSchema.parse({
  // Load configuration from environment variables or use defaults
  defaultModel: process.env.HARMONY_AI_DEFAULT_MODEL || 'harmony-gpt-3.5-turbo',
  models: {
    'harmony-gpt-3.5-turbo': {
      name: 'Harmony GPT-3.5 Turbo',
      version: '1.0',
      endpoint: 'https://api.harmonyhub.com/v1/chat/completions',
      apiKey: process.env.HARMONY_OPENAI_API_KEY || '',
      maxTokens: 2048,
      temperature: 0.7,
    },
    'harmony-gpt-4': {
      name: 'Harmony GPT-4',
      version: '1.0',
      endpoint: 'https://api.harmonyhub.com/v1/chat/completions',
      apiKey: process.env.HARMONY_OPENAI_API_KEY || '',
      maxTokens: 8192,
      temperature: 0.7,
    },
  },
  realTime: {
    transcription: {
      enabled: process.env.HARMONY_AI_REALTIME_TRANSCRIPTION_ENABLED === 'true',
      model: process.env.HARMONY_AI_REALTIME_TRANSCRIPTION_MODEL || 'harmony-google/ASR',
    },
    generation: {
      enabled: process.env.HARMONY_AI_REALTIME_GENERATION_ENABLED === 'true',
      model: process.env.HARMONY_AI_REALTIME_GENERATION_MODEL || 'harmony-google/TTS',
    },
  },
  collaborationFeatures: {
    smartTrackSeparation: {
      enabled: process.env.HARMONY_AI_COLLABORATION_SMART_TRACK_SEPARATION_ENABLED === 'true',
      model:
        process.env.HARMONY_AI_COLLABORATION_SMART_TRACK_SEPARATION_MODEL || 'harmony-spleeter',
    },
    automaticHarmonyGeneration: {
      enabled: process.env.HARMONY_AI_COLLABORATION_AUTOMATIC_HARMONY_GENERATION_ENABLED === 'true',
      model:
        process.env.HARMONY_AI_COLLABORATION_AUTOMATIC_HARMONY_GENERATION_MODEL || 'harmony_net',
    },
    aiAssistedComposition: {
      enabled: process.env.HARMONY_AI_COLLABORATION_AI_ASSISTED_COMPOSITION_ENABLED === 'true',
      model:
        process.env.HARMONY_AI_COLLABORATION_AI_ASSISTED_COMPOSITION_MODEL || 'harmony_muse_net',
    },
  },
  caching: {
    enabled: process.env.HARMONY_AI_CACHING_ENABLED === 'true',
    ttl: parseInt(process.env.HARMONY_AI_CACHING_TTL || '3600', 10),
    maxSize: parseInt(process.env.HARMONY_AI_CACHING_MAX_SIZE || '1000', 10),
  },
  jobQueue: {
    type: 'redis',
    url: process.env.HARMONY_AI_JOB_QUEUE_URL || 'redis://localhost:6379',
    maxConcurrency: parseInt(process.env.HARMONY_AI_JOB_QUEUE_MAX_CONCURRENCY || '5', 10),
    retryAttempts: parseInt(process.env.HARMONY_AI_JOB_QUEUE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.HARMONY_AI_JOB_QUEUE_RETRY_DELAY || '1000', 10),
  },
  providers: {
    harmonyOpenAI: {
      apiKey: process.env.HARMONY_OPENAI_API_KEY || '',
      organization: process.env.HARMONY_OPENAI_ORGANIZATION || '',
    },
    harmonyGoogleAI: {
      apiKey: process.env.HARMONY_GOOGLE_AI_API_KEY || '',
      projectId: process.env.HARMONY_GOOGLE_CLOUD_PROJECT_ID || '',
      location: process.env.HARMONY_GOOGLE_CLOUD_LOCATION || 'us-central1',
    },
    harmonyHuggingFace: {
      apiKey: process.env.HARMONY_HUGGINGFACE_API_KEY || '',
      modelEndpoint:
        process.env.HARMONY_HUGGINGFACE_MODEL_ENDPOINT ||
        'https://api-inference.harmonyhub.co/models/harmony-gpt2',
    },
  },
});

export default aiServicesConfig;
