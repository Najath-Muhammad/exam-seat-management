import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { updateSessionSchema } from '../dto/session.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();
const { sessionController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get(
  '/:sessionId',
  asyncHandler((req, res, next) => sessionController.getSessionById(req, res, next))
);

router.patch(
  '/:sessionId',
  validate(updateSessionSchema),
  asyncHandler((req, res, next) => sessionController.updateSession(req, res, next))
);

router.delete(
  '/:sessionId',
  asyncHandler((req, res, next) => sessionController.deleteSession(req, res, next))
);

export default router;
