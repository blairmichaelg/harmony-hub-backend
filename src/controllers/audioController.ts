import { Request, Response } from 'express';

import { AudioService } from '../services/audioService';
import { validateAudioInput } from '../utils/validators';

export class AudioController {
  private audioService: AudioService;

  constructor() {
    this.audioService = new AudioService();
  }

  public async processAudio(req: Request, res: Response): Promise<void> {
    try {
      const { audioFile, effects } = req.body;

      // Validate input
      const validationError = validateAudioInput(audioFile, effects);

      if (validationError) {
        res.status(400).json({ error: validationError });

        return;
      }

      const processedAudio = await this.audioService.processAudio(
        audioFile,
        effects,
      );

      res.json({ processedAudio });
    } catch (error) {
      console.error('Error processing audio:', error);
      res
        .status(500)
        .json({ error: 'Internal server error while processing audio' });
    }
  }

  // Other audio-related controller methods...
}
