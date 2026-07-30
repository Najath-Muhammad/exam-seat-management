import { sendResponse } from '../../utils/response.util';
import { AppMessages } from '../../constants/messages';
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
      sendResponse(res, HttpStatus.CREATED, AppMessages.SESSION_CREATED, session);
    } catch (error) {
      next(error);
    }
  }

  async getSessionsByExamId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const sessions = await this.sessionService.getSessionsByExamId(examId);
      sendResponse(res, HttpStatus.OK, AppMessages.SESSIONS_RETRIEVED, sessions);
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.getSessionById(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.SESSION_RETRIEVED, session);
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.updateSession(sessionId, req.body);
      sendResponse(res, HttpStatus.OK, AppMessages.SESSION_UPDATED, session);
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      await this.sessionService.deleteSession(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.SESSION_DELETED);
    } catch (error) {
      next(error);
    }
  }

  async finalizeCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.finalizeCandidates(sessionId);
      sendResponse(res, HttpStatus.OK, AppMessages.CANDIDATE_LIST_FINALIZED, session);
    } catch (error) {
      next(error);
    }
  }
}
