import { Request, Response, NextFunction } from 'express';

export interface ICandidateController {
  createCandidate(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCandidatesBySession(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCandidateById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCandidate(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteCandidate(req: Request, res: Response, next: NextFunction): Promise<void>;
  bulkImport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
