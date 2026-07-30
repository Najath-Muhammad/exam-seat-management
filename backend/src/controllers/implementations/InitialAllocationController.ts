import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { IInitialAllocationController } from '../interfaces/IInitialAllocationController';
import { IInitialAllocationService } from '../../services/interfaces/IInitialAllocationService';
import { HttpStatus } from '../../constants/statusCodes';
import { IAuthenticatedRequest } from '../../types/auth.types';

export class InitialAllocationController implements IInitialAllocationController {
  constructor(private readonly initialAllocationService: IInitialAllocationService) {}

  async runInitialAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const adminId = (req as IAuthenticatedRequest).user!.userId;

      const result = await this.initialAllocationService.runInitialAllocation(sessionId, adminId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.INITIAL_ALLOCATION_COMPLETED,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
