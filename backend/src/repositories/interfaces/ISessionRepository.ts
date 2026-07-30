import { ISession } from '../../models/Session';

export interface ISessionRepository {
  create(sessionData: Partial<ISession>): Promise<ISession>;
  findById(id: string): Promise<ISession | null>;
  findByExamId(examId: string): Promise<ISession[]>;
  findByExamIdAndNumber(examId: string, sessionNumber: number): Promise<ISession | null>;
  findOverlappingSessions(examId: string, startAt: Date, endAt: Date): Promise<ISession[]>;
  update(id: string, updateData: Partial<ISession>): Promise<ISession | null>;
  delete(id: string): Promise<boolean>;
}
