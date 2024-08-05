// src/middleware/errorHandler.ts

import { Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response): void => {
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};
