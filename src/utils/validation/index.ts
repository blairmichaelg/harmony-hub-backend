// src/utils/validation/index.ts

import {
  AudioBufferSchema,
  AudioFileExtensionSchema,
  type AudioMetadata,
  AudioMetadataSchema,
  type AudioProcessingOptions,
  AudioProcessingOptionsSchema,
  type EQBand,
  EQBandSchema,
  type EQSettings,
  EQSettingsSchema,
  type ReverbSettings,
  ReverbSettingsSchema,
  validateAudioBuffer,
  validateAudioCodec,
  validateAudioFileExtension,
  validateAudioMetadata,
  validateAudioProcessingOptions,
  validateFileSize,
} from './audio';

export {
  AudioBufferSchema,
  AudioFileExtensionSchema,
  // Types
  AudioMetadata,
  // Schemas
  AudioMetadataSchema,
  AudioProcessingOptions,
  AudioProcessingOptionsSchema,
  EQBand,
  EQBandSchema,
  EQSettings,
  EQSettingsSchema,
  ReverbSettings,
  ReverbSettingsSchema,
  validateAudioBuffer,
  validateAudioCodec,
  validateAudioFileExtension,
  // Validation functions
  validateAudioMetadata,
  validateAudioProcessingOptions,
  validateFileSize,
};

/**
 * Centralized validation module
 *
 * This module exports all validation schemas, functions, and types
 * related to audio processing. It serves as a single point of import
 * for all validation-related functionality in the project.
 *
 * Usage:
 * import { validateAudioMetadata, AudioProcessingOptionsSchema } from '../utils/validation';
 */
