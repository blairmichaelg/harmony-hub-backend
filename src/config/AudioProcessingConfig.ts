// src/config/AudioProcessingConfig.ts

import convict from 'convict';
import * as z from 'zod';

// Define the configuration schema
const audioFormatSchema = z.object({
  extension: z.string().describe('File extension for the audio format'),
  mimeType: z.string().describe('MIME type for the audio format'),
  bitrate: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Bitrate in bits per second'),
  sampleRate: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Sample rate in Hz'),
  channels: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Number of audio channels'),
});

export const AudioProcessingConfigSchema = convict({
  supportedFormats: {
    doc: 'List of supported audio formats',
    format: z.array(audioFormatSchema),
    default: [
      {
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        bitrate: 320000,
        channels: 2,
      },
      {
        extension: 'wav',
        mimeType: 'audio/wav',
        sampleRate: 44100,
        channels: 2,
      },
      { extension: 'ogg', mimeType: 'audio/ogg', bitrate: 128000, channels: 2 },
      { extension: 'aac', mimeType: 'audio/aac', bitrate: 256000, channels: 2 },
      {
        extension: 'flac',
        mimeType: 'audio/flac',
        sampleRate: 96000,
        channels: 2,
      },
    ],
    env: 'AUDIO_SUPPORTED_FORMATS',
  },
  maxFileSize: {
    doc: 'Maximum allowed file size in bytes',
    format: 'number',
    default: 104857600, // 100MB
    env: 'AUDIO_MAX_FILE_SIZE',
  },
  defaultCodec: {
    doc: 'Default audio codec to use',
    format: 'string',
    default: 'mp3',
    env: 'AUDIO_DEFAULT_CODEC',
  },
  algorithms: {
    noiseCancellation: {
      enabled: {
        doc: 'Whether noise cancellation is enabled',
        format: 'Boolean',
        default: true,
        env: 'AUDIO_NOISE_CANCELLATION_ENABLED',
      },
      strength: {
        doc: 'Strength of the noise cancellation algorithm (0-1)',
        format: 'number',
        default: 0.5,
        env: 'AUDIO_NOISE_CANCELLATION_STRENGTH',
      },
    },
    echoCancellation: {
      enabled: {
        doc: 'Whether echo cancellation is enabled',
        format: 'Boolean',
        default: true,
        env: 'AUDIO_ECHO_CANCELLATION_ENABLED',
      },
      strength: {
        doc: 'Strength of the echo cancellation algorithm (0-1)',
        format: 'number',
        default: 0.5,
        env: 'AUDIO_ECHO_CANCELLATION_STRENGTH',
      },
    },
    amplification: {
      enabled: {
        doc: 'Whether amplification is enabled',
        format: 'Boolean',
        default: false,
        env: 'AUDIO_AMPLIFICATION_ENABLED',
      },
      gain: {
        doc: 'Amplification gain in dB',
        format: 'number',
        default: 0,
        env: 'AUDIO_AMPLIFICATION_GAIN',
      },
    },
    normalization: {
      enabled: {
        doc: 'Whether audio normalization is enabled',
        format: 'Boolean',
        default: true,
        env: 'AUDIO_NORMALIZATION_ENABLED',
      },
      strength: {
        doc: 'Strength of the audio normalization algorithm (0-1)',
        format: 'number',
        default: 0.8,
        env: 'AUDIO_NORMALIZATION_STRENGTH',
      },
    },
    compression: {
      enabled: {
        doc: 'Whether audio compression is enabled',
        format: 'Boolean',
        default: true,
        env: 'AUDIO_COMPRESSION_ENABLED',
      },
      strength: {
        doc: 'Strength of the audio compression algorithm (0-1)',
        format: 'number',
        default: 0.3,
        env: 'AUDIO_COMPRESSION_STRENGTH',
      },
    },
  },
  performance: {
    threadPoolSize: {
      doc: 'Number of threads in the pool',
      format: 'nat',
      default: 4,
      env: 'AUDIO_THREAD_POOL_SIZE',
    },
    bufferSize: {
      doc: 'Size of the audio buffer',
      format: 'nat',
      default: 4096,
      env: 'AUDIO_BUFFER_SIZE',
    },
    useGPU: {
      doc: 'Whether to use GPU acceleration',
      format: 'Boolean',
      default: false,
      env: 'AUDIO_USE_GPU',
    },
    gpuMemoryLimit: {
      doc: 'GPU memory limit in bytes',
      format: 'nat',
      default: 1073741824, // 1GB
      env: 'AUDIO_GPU_MEMORY_LIMIT',
    },
  },
  qualityPresets: {
    doc: 'Quality presets for audio processing',
    format: z.record(
      z.object({
        bitrate: z.number().int().positive().describe('Bitrate for the preset'),
        sampleRate: z
          .number()
          .int()
          .positive()
          .describe('Sample rate for the preset'),
        channels: z
          .number()
          .int()
          .positive()
          .describe('Number of channels for the preset'),
      }),
    ),
    default: {
      low: { bitrate: 96000, sampleRate: 44100, channels: 2 },
      medium: { bitrate: 192000, sampleRate: 48000, channels: 2 },
      high: { bitrate: 320000, sampleRate: 96000, channels: 2 },
    },
    env: 'AUDIO_QUALITY_PRESETS',
  },
  effects: {
    reverb: {
      enabled: {
        doc: 'Whether reverb effect is enabled',
        format: 'Boolean',
        default: false,
        env: 'AUDIO_REVERB_ENABLED',
      },
      presets: {
        doc: 'Reverb presets',
        format: z.record(
          z.object({
            roomSize: z
              .number()
              .min(0)
              .max(1)
              .describe('Size of the reverb room (0-1)'),
            damping: z.number().min(0).max(1).describe('Damping factor (0-1)'),
            wetLevel: z.number().min(0).max(1).describe('Wet level (0-1)'),
            dryLevel: z.number().min(0).max(1).describe('Dry level (0-1)'),
          }),
        ),
        default: {
          room: { roomSize: 0.5, damping: 0.5, wetLevel: 0.33, dryLevel: 0.67 },
          hall: { roomSize: 0.8, damping: 0.3, wetLevel: 0.4, dryLevel: 0.6 },
          plate: { roomSize: 0.6, damping: 0.7, wetLevel: 0.3, dryLevel: 0.7 },
        },
        env: 'AUDIO_REVERB_PRESETS',
      },
    },
    equalization: {
      enabled: {
        doc: 'Whether equalization is enabled',
        format: 'Boolean',
        default: false,
        env: 'AUDIO_EQ_ENABLED',
      },
      bands: {
        doc: 'Equalization bands',
        format: z.array(
          z.object({
            frequency: z
              .number()
              .positive()
              .describe('Center frequency of the EQ band'),
            gain: z
              .number()
              .min(-20)
              .max(20)
              .describe('Gain for the EQ band in dB'),
            q: z.number().positive().describe('Q factor for the EQ band'),
          }),
        ),
        default: [
          { frequency: 100, gain: 0, q: 1 },
          { frequency: 1000, gain: 0, q: 1 },
          { frequency: 10000, gain: 0, q: 1 },
        ],
        env: 'AUDIO_EQ_BANDS',
      },
    },
  },
  realTime: {
    bufferSize: {
      doc: 'Size of the real-time audio buffer in samples',
      format: 'nat',
      default: 1024,
      env: 'AUDIO_REALTIME_BUFFER_SIZE',
    },
    latencyTarget: {
      doc: 'Target latency for real-time audio processing in milliseconds',
      format: 'number',
      default: 50,
      env: 'AUDIO_REALTIME_LATENCY_TARGET',
    },
    codec: {
      doc: 'Codec to use for real-time audio communication',
      format: 'string',
      default: 'opus',
      env: 'AUDIO_REALTIME_CODEC',
    },
  },
  effectsLibraries: {
    doc: 'Paths to audio effects libraries (VST/AU plugins)',
    format: z.array(z.string()),
    default: [],
    env: 'AUDIO_EFFECTS_LIBRARIES',
  },
});

export type AudioProcessingConfig = z.infer<typeof AudioProcessingConfigSchema>;

// Create and validate the configuration object
const config = AudioProcessingConfigSchema.getProperties();

export const audioProcessingConfig: AudioProcessingConfig =
  config as unknown as AudioProcessingConfig;

// Validate the configuration
try {
  AudioProcessingConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Audio Processing configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Audio Processing configuration');
  }
  throw error;
}

export default audioProcessingConfig;
