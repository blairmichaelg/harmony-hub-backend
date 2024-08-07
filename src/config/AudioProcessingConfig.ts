// src/config/AudioProcessingConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

const audioFormatSchema = z.object({
  extension: z.string().describe('File extension for the audio format'),
  mimeType: z.string().describe('MIME type for the audio format'),
  bitrate: z.number().int().positive().optional().describe('Bitrate in bits per second'),
  sampleRate: z.number().int().positive().optional().describe('Sample rate in Hz'),
  channels: z.number().int().positive().optional().describe('Number of audio channels'),
});

const algorithmSchema = z.object({
  enabled: z.boolean().describe('Whether the algorithm is enabled'),
  strength: z.number().min(0).max(1).describe('Strength of the algorithm (0-1)'),
});

export const AudioProcessingConfigSchema = z.object({
  supportedFormats: z.array(audioFormatSchema).describe('List of supported audio formats'),
  maxFileSize: z.number().int().positive().describe('Maximum allowed file size in bytes'),
  defaultCodec: z.string().describe('Default audio codec to use'),
  algorithms: z
    .object({
      noiseCancellation: algorithmSchema.describe('Noise cancellation settings'),
      echoCancellation: algorithmSchema.describe('Echo cancellation settings'),
      amplification: z
        .object({
          enabled: z.boolean().describe('Whether amplification is enabled'),
          gain: z.number().min(-20).max(20).describe('Amplification gain in dB'),
        })
        .describe('Amplification settings'),
      normalization: algorithmSchema.describe('Audio normalization settings'),
      compression: algorithmSchema.describe('Audio compression settings'),
    })
    .describe('Audio processing algorithms'),
  performance: z
    .object({
      threadPoolSize: z.number().int().positive().describe('Number of threads in the pool'),
      bufferSize: z.number().int().positive().describe('Size of the audio buffer'),
      useGPU: z.boolean().describe('Whether to use GPU acceleration'),
      gpuMemoryLimit: z.number().int().positive().optional().describe('GPU memory limit in bytes'),
    })
    .describe('Performance settings'),
  qualityPresets: z
    .record(
      z.object({
        bitrate: z.number().int().positive().describe('Bitrate for the preset'),
        sampleRate: z.number().int().positive().describe('Sample rate for the preset'),
        channels: z.number().int().positive().describe('Number of channels for the preset'),
      })
    )
    .describe('Quality presets for audio processing'),
  effects: z
    .object({
      reverb: z
        .object({
          enabled: z.boolean().describe('Whether reverb effect is enabled'),
          presets: z
            .record(
              z.object({
                roomSize: z.number().min(0).max(1).describe('Size of the reverb room (0-1)'),
                damping: z.number().min(0).max(1).describe('Damping factor (0-1)'),
                wetLevel: z.number().min(0).max(1).describe('Wet level (0-1)'),
                dryLevel: z.number().min(0).max(1).describe('Dry level (0-1)'),
              })
            )
            .describe('Reverb presets'),
        })
        .describe('Reverb effect settings'),
      equalization: z
        .object({
          enabled: z.boolean().describe('Whether equalization is enabled'),
          bands: z
            .array(
              z.object({
                frequency: z.number().positive().describe('Center frequency of the EQ band'),
                gain: z.number().min(-20).max(20).describe('Gain for the EQ band in dB'),
                q: z.number().positive().describe('Q factor for the EQ band'),
              })
            )
            .describe('Equalization bands'),
        })
        .describe('Equalization settings'),
    })
    .describe('Audio effects settings'),
});

export type AudioProcessingConfig = z.infer<typeof AudioProcessingConfigSchema>;

const defaultSupportedFormats = [
  { extension: 'mp3', mimeType: 'audio/mpeg', bitrate: 320000, channels: 2 },
  { extension: 'wav', mimeType: 'audio/wav', sampleRate: 44100, channels: 2 },
  { extension: 'ogg', mimeType: 'audio/ogg', bitrate: 128000, channels: 2 },
  { extension: 'aac', mimeType: 'audio/aac', bitrate: 256000, channels: 2 },
  { extension: 'flac', mimeType: 'audio/flac', sampleRate: 96000, channels: 2 },
];

const loadAudioProcessingConfig = (): AudioProcessingConfig => {
  return AudioProcessingConfigSchema.parse({
    supportedFormats: parseJSON(
      getEnvVar('AUDIO_SUPPORTED_FORMATS', JSON.stringify(defaultSupportedFormats))
    ),
    maxFileSize: parseInt(getEnvVar('AUDIO_MAX_FILE_SIZE', '104857600'), 10),
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
      gpuMemoryLimit: parseInt(getEnvVar('AUDIO_GPU_MEMORY_LIMIT', '1073741824'), 10),
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
};

export const audioProcessingConfig: Readonly<AudioProcessingConfig> = Object.freeze(
  loadAudioProcessingConfig()
);

export default audioProcessingConfig;
