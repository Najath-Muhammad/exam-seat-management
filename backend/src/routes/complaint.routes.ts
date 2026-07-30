import { Router, Request, Response, NextFunction } from 'express';
import { ComplaintController } from '../controllers/implementations/ComplaintController';
import { ComplaintService } from '../services/implementations/ComplaintService';
import { ComplaintRepository } from '../repositories/implementations/ComplaintRepository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole, IAuthenticatedRequest } from '../types/auth.types';
import { ForbiddenError } from '../errors';

const router = Router();

// Role guard middleware
const requireRole = (roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as IAuthenticatedRequest).user;
  if (!user || !roles.includes(user.role)) {
    return next(new ForbiddenError('Insufficient permissions'));
  }
  return next();
};

const complaintRepository = new ComplaintRepository();
const complaintService = new ComplaintService(complaintRepository);
const complaintController = new ComplaintController(complaintService);

// All complaint routes require at least INVIGILATOR or ADMIN access
router.use(authMiddleware);
router.use(requireRole([UserRole.ADMIN, UserRole.STAFF]));

router.post('/', complaintController.registerComplaint.bind(complaintController));
router.get('/', complaintController.getAllComplaints.bind(complaintController));
router.get('/session/:sessionId', complaintController.getComplaintsBySession.bind(complaintController));
router.patch('/:id/status', complaintController.updateComplaintStatus.bind(complaintController));

export default router;
