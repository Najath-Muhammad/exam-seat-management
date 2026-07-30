import { ISessionService, ICreateSessionDTO, IUpdateSessionDTO } from '../interfaces/ISessionService';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { ISession } from '../../models/Session';
import { ExamModel } from '../../models/Exam';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';
import { SessionStatus } from '../../types/session.types';
import { Types } from 'mongoose';

export class SessionService implements ISessionService {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async createSession(data: ICreateSessionDTO): Promise<ISession> {
    
    const examExists = await ExamModel.exists({ _id: data.examId });
    if (!examExists) {
      throw new NotFoundError('Exam not found');
    }

    
    if (new Date(data.endAt) <= new Date(data.startAt)) {
      throw new BadRequestError('endAt must be after startAt');
    }

    
    const existingSessionNum = await this.sessionRepository.findByExamIdAndNumber(data.examId, data.sessionNumber);
    if (existingSessionNum) {
      throw new ConflictError(`Session number ${data.sessionNumber} already exists for this exam`);
    }

    
    const overlaps = await this.sessionRepository.findOverlappingSessions(
      data.examId,
      new Date(data.startAt),
      new Date(data.endAt)
    );
    if (overlaps.length > 0) {
      throw new ConflictError('Session time overlaps with an existing session in this exam');
    }

    
    return this.sessionRepository.create({
      ...data,
      examId: new Types.ObjectId(data.examId) as any,
      status: SessionStatus.DRAFT
    });
  }

  async getSessionsByExamId(examId: string): Promise<ISession[]> {
    const examExists = await ExamModel.exists({ _id: examId });
    if (!examExists) {
      throw new NotFoundError('Exam not found');
    }
    return this.sessionRepository.findByExamId(examId);
  }

  async getSessionById(sessionId: string): Promise<ISession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    return session;
  }

  async updateSession(sessionId: string, data: IUpdateSessionDTO): Promise<ISession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    
    if (session.status === SessionStatus.COMPLETED && data.status !== SessionStatus.COMPLETED) {
      throw new BadRequestError('Cannot modify a completed session');
    }

    let newStartAt = session.startAt;
    let newEndAt = session.endAt;

    if (data.startAt) newStartAt = new Date(data.startAt);
    if (data.endAt) newEndAt = new Date(data.endAt);

    if (newEndAt <= newStartAt) {
      throw new BadRequestError('endAt must be after startAt');
    }

    
    if (data.startAt || data.endAt) {
      const overlaps = await this.sessionRepository.findOverlappingSessions(
        session.examId.toString(),
        newStartAt,
        newEndAt
      );
      const otherOverlaps = overlaps.filter(s => s.id !== sessionId);
      if (otherOverlaps.length > 0) {
        throw new ConflictError('Session time overlaps with an existing session');
      }
    }

    const updatePayload = { ...data } as Partial<ISession>;
    if (data.status) {
      updatePayload.status = data.status as SessionStatus;
    }

    const updated = await this.sessionRepository.update(sessionId, updatePayload);
    return updated!;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.status !== SessionStatus.DRAFT && session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestError('Only Draft or Scheduled sessions can be deleted');
    }

    await this.sessionRepository.delete(sessionId);
  }

  async finalizeCandidates(sessionId: string): Promise<ISession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    if (session.isCandidatesFinalized) {
      throw new BadRequestError('Candidate list is already finalized');
    }

    const updated = await this.sessionRepository.update(sessionId, { isCandidatesFinalized: true });
    return updated!;
  }
}
