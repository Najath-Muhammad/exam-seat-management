import { Request, Response, NextFunction } from 'express';

export interface ISessionController {
  createSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSessionsByExamId(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSessionById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  finalizeCandidates(req: Request, res: Response, next: NextFunction): Promise<void>;
}
