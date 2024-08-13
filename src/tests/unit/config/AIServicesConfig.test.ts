// /tests/unit/AIServicesConfig.test.ts

import AIServicesConfig from '../../../src/config/AIServicesConfig';

describe('AIServicesConfig', () => {
  const validConfig = {
    defaultModel: 'harmony-gpt-3.5-turbo',
    models: {
      'harmony-gpt-3.5-turbo': {
        name: 'Harmony GPT-3.5 Turbo',
        version: '1.0',
        endpoint: 'https://api.harmonyhub.com/v1/chat/completions',
        apiKey: 'valid-api-key',
        maxTokens: 2048,
        temperature: 0.7,
      },
      'harmony-gpt-4': {
        name: 'Harmony GPT-4',
        version: '1.0',
        endpoint: 'https://api.harmonyhub.com/v1/chat/completions',
        apiKey: 'valid-api-key',
        maxTokens: 8192,
        temperature: 0.7,
      },
    },
    realTime: {
      transcription: {
        enabled: true,
        model: 'harmony-google/ASR',
      },
      generation: {
        enabled: true,
        model: 'harmony-google/TTS',
      },
    },
    collaborationFeatures: {
      smartTrackSeparation: {
        enabled: true,
        model: 'harmony-spleeter',
      },
      automaticHarmonyGeneration: {
        enabled: true,
        model: 'harmony_net',
      },
      aiAssistedComposition: {
        enabled: true,
        model: 'harmony_muse_net',
      },
    },
    caching: {
      enabled: true,
      ttl: 3600,
      maxSize: 1000,
    },
    jobQueue: {
      type: 'redis',
      url: 'redis://localhost:6379',
      maxConcurrency: 5,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    providers: {
      harmonyOpenAI: {
        apiKey: 'valid-api-key',
        organization: 'valid-organization',
      },
      harmonyGoogleAI: {
        apiKey: 'valid-api-key',
        projectId: 'valid-project-id',
        location: 'us-central1',
      },
      harmonyHuggingFace: {
        apiKey: 'valid-api-key',
        modelEndpoint:
          'https://api-inference.harmonyhub.co/models/harmony-gpt2',
      },
    },
  };

  test('valid configuration', () => {
    expect(() => AIServicesConfig.parse(validConfig)).not.toThrow();
  });

  test('missing required fields', () => {
    const invalidConfig: Partial<typeof validConfig> = { ...validConfig };
    delete invalidConfig.defaultModel;
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('incorrect data types', () => {
    const invalidConfig = { ...validConfig, defaultModel: 123 };
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('invalid URL', () => {
    const invalidConfig = { ...validConfig };
    invalidConfig.models['harmony-gpt-3.5-turbo'].endpoint = 'invalid-url';
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('missing model configuration', () => {
    const invalidConfig = { ...validConfig };
    // delete invalidConfig.models['harmony-gpt-3.5-turbo'];
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('invalid job queue type', () => {
    const invalidConfig = {
      ...validConfig,
      jobQueue: { ...validConfig.jobQueue, type: 'invalid' },
    };
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('negative maxTokens', () => {
    const invalidConfig = { ...validConfig };
    invalidConfig.models['harmony-gpt-3.5-turbo'].maxTokens = -1;
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('temperature out of range', () => {
    const invalidConfig = { ...validConfig };
    invalidConfig.models['harmony-gpt-3.5-turbo'].temperature = 1.5;
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });

  test('missing provider configuration', () => {
    const invalidConfig: Partial<typeof validConfig> = { ...validConfig };
    if (invalidConfig.providers && 'harmonyOpenAI' in invalidConfig.providers) {
      delete (invalidConfig.providers as any).harmonyOpenAI;
    }
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });
  test('invalid caching configuration', () => {
    const invalidConfig = {
      ...validConfig,
      // Add invalid caching configuration here
    };
    expect(() => AIServicesConfig.parse(invalidConfig)).toThrow();
  });
});
