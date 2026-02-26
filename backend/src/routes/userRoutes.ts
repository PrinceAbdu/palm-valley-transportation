import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/usersProfileController';

export const userRoutes = Router();

userRoutes.get('/users/profile', requireAuth, getProfile);
userRoutes.put('/users/profile', requireAuth, updateProfile);

