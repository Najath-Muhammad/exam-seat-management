import { Router } from 'express';
import { container } from '../di/container';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Mounted on /api/sessions/:sessionId/seat-map
const router = Router({ mergeParams: true });
const { seatMapController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get(
  '/',
  asyncHandler((req, res, next) => seatMapController.getSeatMap(req, res, next))
);

router.get(
  '/recovery-status',
  asyncHandler((req, res, next) => seatMapController.getRecoveryStatus(req, res, next))
);

export default router;
