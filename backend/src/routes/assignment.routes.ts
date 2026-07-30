import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { reassignSeatSchema, moveSessionSchema } from '../dto/seatAssignment.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Mounted on /api/assignments
const router = Router();
const { seatAssignmentController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.patch(
  '/:assignmentId/reassign',
  validate(reassignSeatSchema),
  asyncHandler((req, res, next) => seatAssignmentController.reassignSeat(req, res, next))
);

router.patch(
  '/:assignmentId/move-session',
  validate(moveSessionSchema),
  asyncHandler((req, res, next) => seatAssignmentController.moveSession(req, res, next))
);

router.patch(
  '/:assignmentId/cancel',
  asyncHandler((req, res, next) => seatAssignmentController.cancelAssignment(req, res, next))
);

export default router;
