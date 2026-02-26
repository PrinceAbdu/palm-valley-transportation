import { Router } from 'express';
import { health } from '../controllers/healthController';

export const healthRoutes = Router();

healthRoutes.get('/health', health);

