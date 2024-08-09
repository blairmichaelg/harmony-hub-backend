// src/utils/validation/audio.ts

import { z } from 'zod';

import { audioProcessingConfig } from '../../config/AudioProcessingConfig';

/**
 * Schema for basic audio metadata
 */
export const AudioMetadataSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  genre: z.string().optional(),
  year: z.number().int().positive().optional(),
  duration: z.number().positive(),
  sampleRate: z.number().int().positive(),
  channels: z.number().int().positive(),
  bitrate: z.number().int().positive(),
  format: z.string(),
});

export type AudioMetadata = z.infer<typeof AudioMetadataSchema>;

/**
 * Schema for audio file extension validation
 */
export const AudioFileExtensionSchema = z
  .string()
  .refine(
    (ext) =>
      audioProcessingConfig.supportedFormats.some(
        (format) => format.extension === ext.toLowerCase()
      ),
    {
      message: 'Unsupported audio file extension',
    }
  );

/**
 * Schema for audio buffer validation
 */
export const AudioBufferSchema = z
  .instanceof(Float32Array)
  .refine(
    (buffer) => buffer.length > 0 && buffer.length <= audioProcessingConfig.performance.bufferSize,
    {
      message: `Audio buffer must not be empty and must not exceed ${audioProcessingConfig.performance.bufferSize} samples`,
    }
  );

/**
 * Schema for reverb settings
 */
export const ReverbSettingsSchema = z.object({
  presetName: z.enum(
    Object.keys(audioProcessingConfig.effects.reverb.presets) as [string, ...string[]]
  ),
  wetLevel: z.number().min(0).max(1),
  dryLevel: z.number().min(0).max(1),
});

export type ReverbSettings = z.infer<typeof ReverbSettingsSchema>;

/**
 * Schema for equalization band
 */
export const EQBandSchema = z.object({
  frequency: z.number().positive(),
  gain: z.number().min(-20).max(20),
  q: z.number().positive(),
});

export type EQBand = z.infer<typeof EQBandSchema>;

/**
 * Schema for equalization settings
 */
export const EQSettingsSchema = z.object({
  bands: z.array(EQBandSchema).min(1).max(audioProcessingConfig.effects.equalization.bands.length),
});

export type EQSettings = z.infer<typeof EQSettingsSchema>;

/**
 * Schema for audio processing options
 */
export const AudioProcessingOptionsSchema = z.object({
  noiseCancellation: z.boolean().optional(),
  echoCancellation: z.boolean().optional(),
  amplification: z
    .object({
      enabled: z.boolean(),
      gain: z.number().min(-20).max(20),
    })
    .optional(),
  normalization: z.boolean().optional(),
  compression: z.boolean().optional(),
  reverb: ReverbSettingsSchema.optional(),
  equalization: EQSettingsSchema.optional(),
  qualityPreset: z
    .enum(Object.keys(audioProcessingConfig.qualityPresets) as [string, ...string[]])
    .optional(),
});

export type AudioProcessingOptions = z.infer<typeof AudioProcessingOptionsSchema>;

/**
 * Validates audio metadata
 * @param metadata - The audio metadata to validate
 * @returns The validated audio metadata
 * @throws ZodError if validation fails
 */
export const validateAudioMetadata = (metadata: unknown): AudioMetadata => {
  return AudioMetadataSchema.parse(metadata);
};

/**
 * Validates audio file extension
 * @param extension - The file extension to validate
 * @returns The validated file extension
 * @throws ZodError if validation fails
 */
export const validateAudioFileExtension = (extension: string): string => {
  return AudioFileExtensionSchema.parse(extension);
};

/**
 * Validates audio buffer
 * @param buffer - The audio buffer to validate
 * @returns The validated audio buffer
 * @throws ZodError if validation fails
 */
export const validateAudioBuffer = (buffer: Float32Array): Float32Array => {
  return AudioBufferSchema.parse(buffer);
};

/**
 * Validates audio processing options
 * @param options - The audio processing options to validate
 * @returns The validated audio processing options
 * @throws ZodError if validation fails
 */
export const validateAudioProcessingOptions = (options: unknown): AudioProcessingOptions => {
  return AudioProcessingOptionsSchema.parse(options);
};

/**
 * Validates file size
 * @param size - The file size in bytes
 * @returns The validated file size
 * @throws ZodError if validation fails
 */
export const validateFileSize = (size: number, maxFileSize: number): number => {
  return z.number().int().positive().max(audioProcessingConfig.maxFileSize).parse(size);
};

/**
 * Validates audio codec
 * @param codec - The audio codec to validate
 * @returns The validated audio codec
 * @throws ZodError if validation fails
 */
export const validateAudioCodec = (codec: string): string => {
  return z
    .enum([
      audioProcessingConfig.defaultCodec,
      ...audioProcessingConfig.supportedFormats.map((f) => f.extension),
    ])
    .parse(codec);
};
