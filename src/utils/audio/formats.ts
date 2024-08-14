// src/utils/audio/formats.ts

import { audioProcessingConfig } from '../../config/AudioProcessingConfig';
import { CustomError } from '../errorUtils';

const audioProcessingConfigTyped = audioProcessingConfig as {
  supportedFormats: Array<{ extension: string; mimeType: string; codec?: string }>;
};

/**
 * Gets the list of supported audio formats from the configuration
 * @returns {Array<{ extension: string; mimeType: string }>} An array of supported audio formats
 */
export const getSupportedAudioFormats = (): Array<{
  extension: string;
  mimeType: string;
}> => {
  return audioProcessingConfig.supportedFormats.map((format) => ({
    extension: format.extension,
    mimeType: format.mimeType,
  }));
};

/**
 * Checks if a given file extension is a supported audio format
 * @param {string} extension - The file extension to check
 * @returns {boolean} True if the extension is supported, false otherwise
 * @throws {CustomError} If the input is invalid
 */
export const isAudioFormatSupported = (extension: string): boolean => {
  if (typeof extension !== 'string' || extension.trim() === '') {
    throw new CustomError(
      'Invalid file extension',
      'INVALID_FILE_EXTENSION',
      400,
    );
  }

  return audioProcessingConfig.supportedFormats.some(
    (format) => format.extension.toLowerCase() === extension.toLowerCase(),
  );
};

/**
 * Retrieves audio format information for a given file extension
 * @param {string} extension - The file extension
 * @returns {{ mimeType: string; codec: string }} An object containing the MIME type and codec for the format
 * @throws {CustomError} If the format is not supported
  const format = audioProcessingConfigTyped.supportedFormats.find(
export const getAudioFormatInfo = (
  extension: string,
): { mimeType: string; codec: string } => {
  const format = audioProcessingConfig.supportedFormats.find(
    (f) => f.extension.toLowerCase() === extension.toLowerCase(),
  );

  if (!format) {
    throw new CustomError(
      `Unsupported audio format: ${extension}`,
      'UNSUPPORTED_AUDIO_FORMAT',
      400,
    );
  }

  return {
    mimeType: format.mimeType,
    codec: format.codec || format.extension, // Using extension as codec for simplicity
  };
};
