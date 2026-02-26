import dotenv from 'dotenv';
import { z } from 'zod';

// Loads backend/.env if present.
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default('jacksonville_rides'),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),

  CORS_ORIGIN: z.string().min(1).default('https://palmvalleytransportationn.vercel.app,http://localhost:3000'),

  // Optional environment variables for services
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_PHONE_NUMBER: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default('smtp.gmail.com'),
  SMTP_PORT: z.string().optional().default('587'),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default(''),
  GOOGLE_MAPS_API_KEY: z.string().optional().default(''),
  APP_URL: z.string().optional().default('http://localhost:3000'),
  CRON_SECRET: z.string().optional().default(''),
});

export const env = envSchema.parse(process.env);
