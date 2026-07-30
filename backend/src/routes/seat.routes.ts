import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { createSeatSchema, updateSeatSchema, generateSeatsSchema } from '../dto/seat.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();
const { seatController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.post(
  '/generate',
  validate(generateSeatsSchema),
  asyncHandler((req, res, next) => seatController.generateSeats(req, res, next))
);

router.post(
  '/',
  validate(createSeatSchema),
  asyncHandler((req, res, next) => seatController.createSeat(req, res, next))
);

router.get(
  '/',
  asyncHandler((req, res, next) => seatController.getSeats(req, res, next))
);

router.get(
  '/:seatId',
  asyncHandler((req, res, next) => seatController.getSeatById(req, res, next))
);

router.patch(
  '/:seatId',
  validate(updateSeatSchema),
  asyncHandler((req, res, next) => seatController.updateSeat(req, res, next))
);

router.delete(
  '/:seatId',
  asyncHandler((req, res, next) => seatController.deleteSeat(req, res, next))
);

export default router;
