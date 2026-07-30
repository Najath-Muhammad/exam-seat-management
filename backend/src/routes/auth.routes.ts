import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../dto/auth.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const { authController } = container;

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler((req, res, next) => authController.login(req, res, next))
);

router.post(
  '/refresh',
  asyncHandler((req, res, next) => authController.refresh(req, res, next))
);

router.post(
  '/logout',
  asyncHandler((req, res, next) => authController.logout(req, res, next))
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler((req, res, next) => authController.getMe(req, res, next))
);

export default router;
