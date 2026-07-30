import { Router } from 'express';
import { container } from '../di/container';
import { validate } from '../middlewares/validate.middleware';
import { createCandidateSchema } from '../dto/candidate.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';
import multer from 'multer';
import os from 'os';

const router = Router({ mergeParams: true });
const { candidateController, sessionController } = container;

const upload = multer({ dest: os.tmpdir() });

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.post(
  '/',
  validate(createCandidateSchema),
  asyncHandler((req, res, next) => candidateController.createCandidate(req, res, next))
);

router.get(
  '/',
  asyncHandler((req, res, next) => candidateController.getCandidatesBySession(req, res, next))
);

router.post(
  '/import',
  upload.single('file'),
  asyncHandler((req, res, next) => candidateController.bulkImport(req, res, next))
);

router.patch(
  '/finalize',
  asyncHandler((req, res, next) => sessionController.finalizeCandidates(req, res, next))
);

export default router;
