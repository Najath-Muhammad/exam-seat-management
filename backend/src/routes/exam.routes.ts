import { Router, Request, Response, NextFunction } from 'express';
import { ExamModel } from '../models/Exam';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/', asyncHandler(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const exams = await ExamModel.find().exec();
    res.json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
}));

router.get('/:examId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exam = await ExamModel.findById(req.params.examId).exec();
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found' });
      return;
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
}));

export default router;
