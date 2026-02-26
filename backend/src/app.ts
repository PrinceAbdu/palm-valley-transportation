import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import 'express-async-errors';

import { env } from './config/env';
import { apiRoutes } from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isAllowedOrigin = (requestOrigin: string) => {
    return allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin === requestOrigin) return true;

      if (allowedOrigin.includes('*')) {
        const escapedPattern = allowedOrigin
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        return new RegExp(`^${escapedPattern}$`).test(requestOrigin);
      }

      return false;
    });
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(helmet());

  // Raw body for Stripe webhooks (must come before json parser)
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running' });
  });

  app.get('/favicon.ico', (req, res) => res.status(204));

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
