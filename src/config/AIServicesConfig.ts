// src/config/AIServicesConfig.ts

import convict from 'convict';
import { z } from 'zod';

// Define the configuration schema
const AIModelSchema = z.object({
  name: z.string().nonempty().describe('Model name'),
  version: z.string().nonempty().describe('Model version'),
  endpoint: z.string().url().describe('Model API endpoint URL'),
  apiKey: z.string().nonempty().describe('API key for the model'),
  maxTokens: z.coerce.number().int().positive().describe('Maximum number of tokens'),
  temperature: z.coerce.number().min(0).max(1).describe('Temperature for text generation'),
});

const AIServicesConfigSchema = convict({
  defaultModel: {
    doc: 'Default AI model to use',
    format: 'string',
    default: 'gpt-3.5-turbo',
    env: 'AI_DEFAULT_MODEL',
  },
  models: {
    doc: 'Available AI models',
    format: z.record(AIModelSchema),
    default: {
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        version: '1.0',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: '', // Set your API key here or use environment variable
        maxTokens: 2048,
        temperature: 0.7,
      },
      'gpt-4': {
        name: 'GPT-4',
        version: '1.0',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: '', // Set your API key here or use environment variable
        maxTokens: 8192,
        temperature: 0.7,
      },
    },
    env: 'AI_MODELS',
  },
  jobQueue: {
    type: {
      doc: 'Type of job queue',
      format: ['redis', 'rabbitmq', 'sqs'],
      default: 'redis',
      env: 'AI_JOB_QUEUE_TYPE',
    },
    url: {
      doc: 'Job queue URL',
      format: 'url',
      default: 'redis://localhost:6379',
      env: 'AI_JOB_QUEUE_URL',
    },
    maxConcurrency: {
      doc: 'Maximum concurrent jobs',
      format: 'nat',
      default: 5,
      env: 'AI_JOB_QUEUE_MAX_CONCURRENCY',
    },
    retryAttempts: {
      doc: 'Number of retry attempts',
      format: 'nat',
      default: 3,
      env: 'AI_JOB_QUEUE_RETRY_ATTEMPTS',
    },
    retryDelay: {
      doc: 'Delay between retries in milliseconds',
      format: 'nat',
      default: 1000,
      env: 'AI_JOB_QUEUE_RETRY_DELAY',
    },
  },
  providers: {
    openai: {
      apiKey: {
        doc: 'API key for OpenAI',
        format: 'string',
        default: '',
        env: 'OPENAI_API_KEY',
        sensitive: true,
      },
      organization: {
        doc: 'Organization ID for OpenAI (optional)',
        format: 'string',
        default: '',
        env: 'OPENAI_ORGANIZATION',
      },
    },
    googleAI: {
      apiKey: {
        doc: 'API key for Google AI',
        format: 'string',
        default: '',
        env: 'GOOGLE_AI_API_KEY',
        sensitive: true,
      },
      projectId: {
        doc: 'Google Cloud project ID',
        format: 'string',
        default: '',
        env: 'GOOGLE_CLOUD_PROJECT_ID',
      },
      location: {
        doc: 'Google Cloud location',
        format: 'string',
        default: 'us-central1',
        env: 'GOOGLE_CLOUD_LOCATION',
      },
    },
    huggingface: {
      apiKey: {
        doc: 'API key for Hugging Face',
        format: 'string',
        default: '',
        env: 'HUGGINGFACE_API_KEY',
        sensitive: true,
      },
      modelEndpoint: {
        doc: 'Hugging Face model endpoint URL',
        format: 'url',
        default: 'https://api-inference.huggingface.co/models/gpt2',
        env: 'HUGGINGFACE_MODEL_ENDPOINT',
      },
    },
  },
  fineTuning: {
    enabled: {
      doc: 'Whether fine-tuning is enabled',
      format: 'Boolean',
      default: false,
      env: 'AI_FINE_TUNING_ENABLED',
    },
    datasetPath: {
      doc: 'Path to the fine-tuning dataset',
      format: 'string',
      default: '',
      env: 'AI_FINE_TUNING_DATASET_PATH',
    },
    epochs: {
      doc: 'Number of training epochs',
      format: 'nat',
      default: 3,
      env: 'AI_FINE_TUNING_EPOCHS',
    },
    learningRate: {
      doc: 'Learning rate for training',
      format: 'number',
      default: 0.00002,
      env: 'AI_FINE_TUNING_LEARNING_RATE',
    },
    batchSize: {
      doc: 'Batch size for training',
      format: 'nat',
      default: 4,
      env: 'AI_FINE_TUNING_BATCH_SIZE',
    },
    validationSplit: {
      doc: 'Fraction of data to use for validation',
      format: 'number',
      default: 0.2,
      env: 'AI_FINE_TUNING_VALIDATION_SPLIT',
    },
  },
  caching: {
    enabled: {
      doc: 'Whether caching is enabled',
      format: 'Boolean',
      default: true,
      env: 'AI_CACHING_ENABLED',
    },
    ttl: {
      doc: 'Time-to-live for cached items in seconds',
      format: 'nat',
      default: 3600,
      env: 'AI_CACHING_TTL',
    },
    maxSize: {
      doc: 'Maximum number of items in the cache',
      format: 'nat',
      default: 1000,
      env: 'AI_CACHING_MAX_SIZE',
    },
  },
  realTime: {
    transcription: {
      enabled: {
        doc: 'Whether real-time transcription is enabled',
        format: 'Boolean',
        default: false,
        env: 'AI_REALTIME_TRANSCRIPTION_ENABLED',
      },
      model: {
        doc: 'Name of the AI model to use for real-time transcription',
        format: 'string',
        default: 'google/ASR',
        env: 'AI_REALTIME_TRANSCRIPTION_MODEL',
      },
    },
    generation: {
      enabled: {
        doc: 'Whether real-time audio generation is enabled',
        format: 'Boolean',
        default: false,
        env: 'AI_REALTIME_GENERATION_ENABLED',
      },
      model: {
        doc: 'Name of the AI model to use for real-time audio generation',
        format: 'string',
        default: 'google/TTS',
        env: 'AI_REALTIME_GENERATION_MODEL',
      },
    },
  },
  collaborationFeatures: {
    smartTrackSeparation: {
      enabled: {
        doc: 'Whether AI-powered smart track separation is enabled',
        format: 'Boolean',
        default: false,
        env: 'AI_COLLABORATION_SMART_TRACK_SEPARATION_ENABLED',
      },
      model: {
        doc: 'Name of the AI model to use for smart track separation',
        format: 'string',
        default: 'spleeter',
        env: 'AI_COLLABORATION_SMART_TRACK_SEPARATION_MODEL',
      },
    },
    automaticHarmonyGeneration: {
      enabled: {
        doc: 'Whether automatic harmony generation is enabled',
        format: 'Boolean',
        default: false,
        env: 'AI_COLLABORATION_AUTOMATIC_HARMONY_GENERATION_ENABLED',
      },
      model: {
        doc: 'Name of the AI model to use for automatic harmony generation',
        format: 'string',
        default: 'harmony_net',
        env: 'AI_COLLABORATION_AUTOMATIC_HARMONY_GENERATION_MODEL',
      },
    },
    aiAssistedComposition: {
      enabled: {
        doc: 'Whether AI-assisted composition is enabled',
        format: 'Boolean',
        default: false,
        env: 'AI_COLLABORATION_AI_ASSISTED_COMPOSITION_ENABLED',
      },
      model: {
        doc: 'Name of the AI model to use for AI-assisted composition',
        format: 'string',
        default: 'muse_net',
        env: 'AI_COLLABORATION_AI_ASSISTED_COMPOSITION_MODEL',
      },
    },
  },
});

export type AIServicesConfig = z.infer<typeof AIServicesConfigSchema>;

// Create and validate the configuration object
export const aiServicesConfig = AIServicesConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

export default aiServicesConfig;
