import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { updateCandidateSchema } from '../dto/candidate.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();
const { candidateController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get(
  '/:candidateId',
  asyncHandler((req, res, next) => candidateController.getCandidateById(req, res, next))
);

router.patch(
  '/:candidateId',
  validate(updateCandidateSchema),
  asyncHandler((req, res, next) => candidateController.updateCandidate(req, res, next))
);

router.delete(
  '/:candidateId',
  asyncHandler((req, res, next) => candidateController.deleteCandidate(req, res, next))
);

router.get(
  '/:candidateId/assignment',
  asyncHandler((req, res, next) => container.seatAssignmentController.getCandidateAssignment(req, res, next))
);

export default router;
