import { Request, Response, NextFunction } from 'express';

export interface IDashboardController {
  getOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
