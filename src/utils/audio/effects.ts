// src/utils/audio/effects.ts

import { createAudioContext } from 'web-audio-api';
import { audioProcessingConfig } from '../../config/AudioProcessingConfig';
import { CustomError } from '../errorUtils';
import {
  validateAudioBuffer,
  validateReverbSettings,
} from '../validation/audio';

/**
 * Applies reverb to an audio buffer using the `Tuna` library
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

    const audioContext = createAudioContext();
    const tuna = new (require('tuna'))(audioContext); // Import Tuna dynamically

    const reverb = new tuna.Convolver({
      roomSize: preset.roomSize,
      damping: preset.damping,
      wetLevel: preset.wetLevel,
      dryLevel: preset.dryLevel,
    });

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioContext.createBuffer(
      1,
      audioBuffer.length,
      audioContext.sampleRate,
    );
    bufferSource.buffer.getChannelData(0).set(audioBuffer);

    const reverbNode = reverb.generate(bufferSource);
    const gainNode = audioContext.createGain();
    gainNode.gain.value = preset.wetLevel + preset.dryLevel;

    bufferSource.connect(reverbNode);
    reverbNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    await bufferSource.start();
    await audioContext.resume();

    const processedBuffer = new Float32Array(audioBuffer.length);
    audioContext.destination.getChannelData(0).set(processedBuffer);

    return processedBuffer;
  } catch (error) {
    throw new CustomError(
      'Failed to apply reverb',
      'REVERB_PROCESSING_ERROR',
      500,
    );
  }
};
