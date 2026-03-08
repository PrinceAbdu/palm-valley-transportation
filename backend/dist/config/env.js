"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Loads backend/.env if present.
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    MONGODB_URI: zod_1.z.string().min(1),
    MONGODB_DB_NAME: zod_1.z.string().min(1).default('jacksonville_rides'),
    JWT_SECRET: zod_1.z.string().min(16),
    JWT_EXPIRES_IN: zod_1.z.string().min(1).default('7d'),
    CORS_ORIGIN: zod_1.z.string().min(1).default('https://palmvalleytransportationn.vercel.app,http://localhost:3000'),
    // Optional environment variables for services
    STRIPE_SECRET_KEY: zod_1.z.string().optional().default(''),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional().default(''),
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional().default(''),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional().default(''),
    TWILIO_PHONE_NUMBER: zod_1.z.string().optional().default(''),
    SMTP_HOST: zod_1.z.string().optional().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().optional().default('587'),
    SMTP_USER: zod_1.z.string().optional().default(''),
    SMTP_PASSWORD: zod_1.z.string().optional().default(''),
    SMTP_FROM: zod_1.z.string().optional().default(''),
    SUPABASE_URL: zod_1.z.string().optional().default(''),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional().default(''),
    SUPABASE_BUCKET: zod_1.z.string().optional().default('PVTB'),
    GOOGLE_MAPS_API_KEY: zod_1.z.string().optional().default(''),
    APP_URL: zod_1.z.string().optional().default('http://localhost:3000'),
    CRON_SECRET: zod_1.z.string().optional().default(''),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional().default(''),
});
exports.env = envSchema.parse(process.env);
