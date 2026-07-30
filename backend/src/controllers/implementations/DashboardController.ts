import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { IDashboardController } from '../interfaces/IDashboardController';
import { IDashboardService } from '../../services/interfaces/IDashboardService';
import { HttpStatus } from '../../constants/statusCodes';

export class DashboardController implements IDashboardController {
  constructor(private readonly dashboardService: IDashboardService) {}

  async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = req.query.examId as string;
      const sessionId = req.query.sessionId as string;

      const data = await this.dashboardService.getDashboardData(examId, sessionId);

      sendResponse(res, HttpStatus.OK, AppMessages.DASHBOARD_DATA_RETRIEVED, data);
    } catch (error) {
      next(error);
    }
  }
}
