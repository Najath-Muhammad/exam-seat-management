import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { createSessionSchema } from '../dto/session.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router({ mergeParams: true });
const { sessionController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

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
