import { Router } from 'express';
import { container } from '../di/container';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Mounted on /api/admin/dashboard
const router = Router();
const { dashboardController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/overview', asyncHandler((req, res, next) => dashboardController.getOverview(req, res, next)));

export default router;
