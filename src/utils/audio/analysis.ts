// src/utils/audio/analysis.ts

import { CustomError } from '../errorUtils';
import { validateAudioBuffer } from '../validation/audio';

/**
 * Calculates the Root Mean Square (RMS) of an audio buffer
 * @param {Float32Array} audioBuffer - The audio buffer
 * @returns {number} The RMS value
 * @throws {CustomError} If the input is not a valid audio buffer
 */
export const calculateRMS = (audioBuffer: Float32Array): number => {
  try {
    validateAudioBuffer(audioBuffer);
    let sumOfSquares = 0;

    for (let i = 0; i < audioBuffer.length; i++) {
      sumOfSquares += audioBuffer[i] * audioBuffer[i];
    }

    return Math.sqrt(sumOfSquares / audioBuffer.length);
  } catch (error) {
    throw new CustomError('Invalid audio buffer', 'INVALID_AUDIO_BUFFER', 400);
  }
};

/**
 * Generates a simplified waveform for visualization
 * @param {Float32Array} audioBuffer - The audio buffer
 * @param {number} width - The desired width of the waveform in pixels
 * @returns {number[]} An array of waveform data points
 * @throws {CustomError} If the input is not a valid audio buffer
 */
export const generateWaveform = (
  audioBuffer: Float32Array,
  width: number,
): number[] => {
  try {
    validateAudioBuffer(audioBuffer);
    const waveform: number[] = new Array(width).fill(0);
    const chunkSize = Math.floor(audioBuffer.length / width);

    for (let i = 0; i < width; i++) {
      let sum = 0;

      for (let j = 0; j < chunkSize; j++) {
        const sampleIndex = i * chunkSize + j;

        if (sampleIndex < audioBuffer.length) {
          sum += Math.abs(audioBuffer[sampleIndex]);
        }
      }

      waveform[i] = sum / chunkSize;
    }

    return waveform;
  } catch (error) {
    throw new CustomError('Invalid audio buffer', 'INVALID_AUDIO_BUFFER', 400);
  }
};

/**
 * Extracts audio metadata from a file path
 * @param {string} filePath - The path to the audio file
 * @returns {Promise<AudioMetadata>} A promise resolving to the audio metadata
 * @throws {CustomError} If metadata extraction fails
 */
export const extractAudioMetadata = async (
  filePath: string,
): Promise<AudioMetadata> => {
  try {
    // Placeholder - Implement actual metadata extraction using a library like music-metadata
    const metadata: AudioMetadata = {
      title: 'Test Title',
      artist: 'Test Artist',
      album: 'Test Album',
      genre: 'Test Genre',
      year: 2024,
      duration: 180,
      sampleRate: 44100,
      channels: 2,
      bitrate: 320000,
      format: 'mp3',
    };

    return metadata;
  } catch (error) {
    throw new CustomError(
      'Failed to extract audio metadata',
      'METADATA_EXTRACTION_ERROR',
      500,
    );
  }
};
