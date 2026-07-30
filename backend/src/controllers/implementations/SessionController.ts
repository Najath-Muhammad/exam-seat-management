import { Request, Response, NextFunction } from 'express';
import { ISessionController } from '../interfaces/ISessionController';
import { ISessionService } from '../../services/interfaces/ISessionService';
import { HttpStatus } from '../../constants/statusCodes';

export class SessionController implements ISessionController {
  constructor(private readonly sessionService: ISessionService) {}

  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const session = await this.sessionService.createSession({
        examId,
        ...req.body
      });
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: AppMessages.SESSION_CREATED,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionsByExamId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const sessions = await this.sessionService.getSessionsByExamId(examId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SESSIONS_RETRIEVED,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.getSessionById(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SESSION_RETRIEVED,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.updateSession(sessionId, req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SESSION_UPDATED,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      await this.sessionService.deleteSession(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.SESSION_DELETED
      });
    } catch (error) {
      next(error);
    }
  }

  async finalizeCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.finalizeCandidates(sessionId);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AppMessages.CANDIDATE_LIST_FINALIZED,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }
}
