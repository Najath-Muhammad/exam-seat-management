import { Request, Response, NextFunction } from 'express';

export interface ISeatMapController {
  getSeatMap(req: Request, res: Response, next: NextFunction): Promise<void>;
  getRecoveryStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
