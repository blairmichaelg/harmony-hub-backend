import { IAudioProcessor } from '../interfaces/IAudioProcessor';
import { logger } from '../utils/logger';

export class AudioService {
  private audioProcessor: IAudioProcessor;

  constructor(audioProcessor: IAudioProcessor) {
    this.audioProcessor = audioProcessor;
  }

  public async processAudio(audioFile: Buffer, effects: string[]): Promise<Buffer> {
    try {
      logger.info(`Processing audio with effects: ${effects.join(', ')}`);
      const processedAudio = await this.audioProcessor.process(audioFile, effects);

      logger.info('Audio processing completed successfully');

      return processedAudio;
    } catch (error) {
      logger.error('Error processing audio:', error);
      throw new Error('Failed to process audio');
    }
  }

  // Other audio-related service methods...
}
