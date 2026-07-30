import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createSessionSchema } from '../dto/session.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Using mergeParams to access examId from parent router if nested
const router = Router({ mergeParams: true });
const { sessionController } = container;

// All session routes are Admin only
router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

// Nested routes (Mounted on /api/exams/:examId/sessions)
router.post(
  '/',
  validate(createSessionSchema),
  asyncHandler((req, res, next) => sessionController.createSession(req, res, next))
);

router.get(
  '/',
  asyncHandler((req, res, next) => sessionController.getSessionsByExamId(req, res, next))
);

export default router;
