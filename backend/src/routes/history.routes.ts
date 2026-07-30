import { Router } from 'express';
import { container } from '../di/container';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

// Mounted on /api/admin/history
const router = Router();
const { assignmentHistoryController } = container;

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/', asyncHandler((req, res, next) => assignmentHistoryController.getHistory(req, res, next)));
router.get('/candidates/:candidateId', asyncHandler((req, res, next) => assignmentHistoryController.getCandidateHistory(req, res, next)));

export default router;
