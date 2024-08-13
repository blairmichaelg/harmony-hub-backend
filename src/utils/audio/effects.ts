// src/utils/audio/effects.ts

import { audioProcessingConfig } from '../../config/AudioProcessingConfig';
import { CustomError } from '../errorUtils';
import {
  validateAudioBuffer,
  validateReverbSettings,
} from '../validation/audio';

/**
 * Applies reverb to an audio buffer
 * @param {Float32Array} audioBuffer - The audio buffer
 * @param {ReverbSettings} settings - Reverb settings
 * @returns {Promise<Float32Array>} A promise resolving to the processed audio buffer
 * @throws {CustomError} If the input is invalid or processing fails
 */
export const applyReverb = async (
  audioBuffer: Float32Array,
  settings: ReverbSettings,
): Promise<Float32Array> => {
  try {
    validateAudioBuffer(audioBuffer);
    validateReverbSettings(settings);
    const preset =
      audioProcessingConfig.effects.reverb.presets[settings.presetName];

    // TODO: Implement actual reverb processing using a library like Tuna here.
    // Use the 'preset' values to configure the reverb effect.

    // Example using a simple gain adjustment for demonstration:
    const wetGain = preset.wetLevel;
    const dryGain = preset.dryLevel;
    const processedBuffer = audioBuffer.map(
      (sample) => sample * (wetGain + dryGain),
    );

    return processedBuffer;
  } catch (error) {
    throw new CustomError(
      'Failed to apply reverb',
      'REVERB_PROCESSING_ERROR',
      500,
    );
  }
};
