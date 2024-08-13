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
