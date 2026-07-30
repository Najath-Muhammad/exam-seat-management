import { Request, Response, NextFunction } from 'express';

export interface IInitialAllocationController {
  runInitialAllocation(req: Request, res: Response, next: NextFunction): Promise<void>;
}
