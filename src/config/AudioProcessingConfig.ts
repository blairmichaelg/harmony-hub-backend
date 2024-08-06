// AudioProcessingConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from './utils';

const audioFormatSchema = z.object({
  extension: z.string(),
  mimeType: z.string(),
  bitrate: z.number().int().positive().optional(),
  sampleRate: z.number().int().positive().optional(),
  channels: z.number().int().positive().optional(),
});

const algorithmSchema = z.object({
  enabled: z.boolean(),
  strength: z.number().min(0).max(1),
});

const audioProcessingConfigSchema = z.object({
  supportedFormats: z.array(audioFormatSchema),
  maxFileSize: z.number().int().positive(),
  defaultCodec: z.string(),
  algorithms: z.object({
    noiseCancellation: algorithmSchema,
    echoCancellation: algorithmSchema,
    amplification: z.object({
      enabled: z.boolean(),
      gain: z.number().min(-20).max(20),
    }),
    normalization: algorithmSchema,
    compression: algorithmSchema,
  }),
  performance: z.object({
    threadPoolSize: z.number().int().positive(),
    bufferSize: z.number().int().positive(),
    useGPU: z.boolean(),
    gpuMemoryLimit: z.number().int().positive().optional(),
  }),
  qualityPresets: z.record(
    z.object({
      bitrate: z.number().int().positive(),
      sampleRate: z.number().int().positive(),
      channels: z.number().int().positive(),
    })
  ),
  effects: z.object({
    reverb: z.object({
      enabled: z.boolean(),
      presets: z.record(
        z.object({
          roomSize: z.number().min(0).max(1),
          damping: z.number().min(0).max(1),
          wetLevel: z.number().min(0).max(1),
          dryLevel: z.number().min(0).max(1),
        })
      ),
    }),
    equalization: z.object({
      enabled: z.boolean(),
      bands: z.array(
        z.object({
          frequency: z.number().positive(),
          gain: z.number().min(-20).max(20),
          q: z.number().positive(),
        })
      ),
    }),
  }),
});

type AudioProcessingConfig = z.infer<typeof audioProcessingConfigSchema>;

const defaultSupportedFormats = [
  { extension: 'mp3', mimeType: 'audio/mpeg', bitrate: 320000, channels: 2 },
  { extension: 'wav', mimeType: 'audio/wav', sampleRate: 44100, channels: 2 },
  { extension: 'ogg', mimeType: 'audio/ogg', bitrate: 128000, channels: 2 },
  { extension: 'aac', mimeType: 'audio/aac', bitrate: 256000, channels: 2 },
  { extension: 'flac', mimeType: 'audio/flac', sampleRate: 96000, channels: 2 },
];

const audioProcessingConfig: AudioProcessingConfig = audioProcessingConfigSchema.parse({
  supportedFormats: parseJSON(
    getEnvVar('AUDIO_SUPPORTED_FORMATS', JSON.stringify(defaultSupportedFormats))
  ),
  maxFileSize: parseInt(getEnvVar('AUDIO_MAX_FILE_SIZE', '104857600'), 10), // 100MB default
  defaultCodec: getEnvVar('AUDIO_DEFAULT_CODEC', 'mp3'),
  algorithms: {
    noiseCancellation: {
      enabled: getEnvVar('AUDIO_NOISE_CANCELLATION_ENABLED', 'true') === 'true',
      strength: parseFloat(getEnvVar('AUDIO_NOISE_CANCELLATION_STRENGTH', '0.5')),
    },
    echoCancellation: {
      enabled: getEnvVar('AUDIO_ECHO_CANCELLATION_ENABLED', 'true') === 'true',
      strength: parseFloat(getEnvVar('AUDIO_ECHO_CANCELLATION_STRENGTH', '0.5')),
    },
    amplification: {
      enabled: getEnvVar('AUDIO_AMPLIFICATION_ENABLED', 'false') === 'true',
      gain: parseFloat(getEnvVar('AUDIO_AMPLIFICATION_GAIN', '0')),
    },
    normalization: {
      enabled: getEnvVar('AUDIO_NORMALIZATION_ENABLED', 'true') === 'true',
      strength: parseFloat(getEnvVar('AUDIO_NORMALIZATION_STRENGTH', '0.8')),
    },
    compression: {
      enabled: getEnvVar('AUDIO_COMPRESSION_ENABLED', 'true') === 'true',
      strength: parseFloat(getEnvVar('AUDIO_COMPRESSION_STRENGTH', '0.3')),
    },
  },
  performance: {
    threadPoolSize: parseInt(getEnvVar('AUDIO_THREAD_POOL_SIZE', '4'), 10),
    bufferSize: parseInt(getEnvVar('AUDIO_BUFFER_SIZE', '4096'), 10),
    useGPU: getEnvVar('AUDIO_USE_GPU', 'false') === 'true',
    gpuMemoryLimit: parseInt(getEnvVar('AUDIO_GPU_MEMORY_LIMIT', '1073741824'), 10), // 1GB default
  },
  qualityPresets: parseJSON(
    getEnvVar(
      'AUDIO_QUALITY_PRESETS',
      JSON.stringify({
        low: { bitrate: 96000, sampleRate: 44100, channels: 2 },
        medium: { bitrate: 192000, sampleRate: 48000, channels: 2 },
        high: { bitrate: 320000, sampleRate: 96000, channels: 2 },
      })
    )
  ),
  effects: {
    reverb: {
      enabled: getEnvVar('AUDIO_REVERB_ENABLED', 'false') === 'true',
      presets: parseJSON(
        getEnvVar(
          'AUDIO_REVERB_PRESETS',
          JSON.stringify({
            room: { roomSize: 0.5, damping: 0.5, wetLevel: 0.33, dryLevel: 0.67 },
            hall: { roomSize: 0.8, damping: 0.3, wetLevel: 0.4, dryLevel: 0.6 },
            plate: { roomSize: 0.6, damping: 0.7, wetLevel: 0.3, dryLevel: 0.7 },
          })
        )
      ),
    },
    equalization: {
      enabled: getEnvVar('AUDIO_EQ_ENABLED', 'false') === 'true',
      bands: parseJSON(
        getEnvVar(
          'AUDIO_EQ_BANDS',
          JSON.stringify([
            { frequency: 100, gain: 0, q: 1 },
            { frequency: 1000, gain: 0, q: 1 },
            { frequency: 10000, gain: 0, q: 1 },
          ])
        )
      ),
    },
  },
});

export { audioProcessingConfig, AudioProcessingConfig };
