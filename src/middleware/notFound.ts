// src/middleware/notFound.ts

import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
  });
};
