import { Request, Response, NextFunction } from 'express';

export interface IAssignmentHistoryController {
  getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCandidateHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
