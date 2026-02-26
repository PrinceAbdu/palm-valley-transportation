import { Router } from 'express';
import { healthRoutes } from './healthRoutes';
import { authRoutes } from './authRoutes';
import { bookingRoutes } from './bookingRoutes';
import { adminRoutes } from './adminRoutes';
import { paymentRoutes } from './paymentRoutes';
import { miscRoutes } from './miscRoutes';

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use(authRoutes);
apiRoutes.use(bookingRoutes);
apiRoutes.use(adminRoutes);
apiRoutes.use(paymentRoutes);
apiRoutes.use(miscRoutes);
