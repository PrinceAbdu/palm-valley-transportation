import type { Request, Response } from 'express';
import mongoose from 'mongoose';

export function health(_req: Request, res: Response) {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongo: {
      readyState: mongoose.connection.readyState
    }
  });
}

