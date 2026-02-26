import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: err.flatten()
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message
    });
  }

  return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
}

