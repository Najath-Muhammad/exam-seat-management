import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { assignSeatSchema } from '../dto/seatAssignment.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Mounted on /api/sessions/:sessionId/assignments
const router = Router({ mergeParams: true });
const { seatAssignmentController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get(
  '/',
  asyncHandler((req, res, next) => seatAssignmentController.getSessionAssignments(req, res, next))
);

router.post(
  '/',
  validate(assignSeatSchema),
  asyncHandler((req, res, next) => seatAssignmentController.assignSeat(req, res, next))
);

router.post(
  '/auto',
  asyncHandler((req, res, next) => seatAssignmentController.autoAssignSeats(req, res, next))
);

router.get(
  '/seats/available',
  asyncHandler((req, res, next) => seatAssignmentController.getAvailableSeats(req, res, next))
);

export default router;
