import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
import { Request, Response, NextFunction } from 'express';
import { IAssignmentHistoryController } from '../interfaces/IAssignmentHistoryController';
import { IAssignmentHistoryService } from '../../services/interfaces/IAssignmentHistoryService';
import { HttpStatus } from '../../constants/statusCodes';
import { HistoryAction } from '../../types/assignmentHistory.types';

export class AssignmentHistoryController implements IAssignmentHistoryController {
  constructor(private readonly historyService: IAssignmentHistoryService) {}

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filter = {
        examId: req.query.examId as string,
        sessionId: req.query.sessionId as string,
        candidateId: req.query.candidateId as string,
        seatId: req.query.seatId as string,
        action: req.query.action as HistoryAction,
        adminId: req.query.adminId as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };

      const result = await this.historyService.getHistory(filter, page, limit);

      sendResponse(res, HttpStatus.OK, AppMessages.ASSIGNMENT_HISTORY_RETRIEVED, result);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { candidateId } = req.params;
      const history = await this.historyService.getCandidateHistory(candidateId);

      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_ASSIGNMENT_HISTORY_RETRIEVED, history);
    } catch (error) {
      next(error);
    }
  }
}
