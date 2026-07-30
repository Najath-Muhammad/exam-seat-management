import { Router } from 'express';
import { container } from '../di/container';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router({ mergeParams: true });
const { initialAllocationController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.post(
  '/',
  asyncHandler((req, res, next) => initialAllocationController.runInitialAllocation(req, res, next))
);

export default router;
