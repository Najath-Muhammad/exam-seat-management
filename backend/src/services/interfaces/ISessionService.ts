import { ISession } from '../../models/Session';

export interface ICreateSessionDTO {
  examId: string;
  sessionNumber: number;
  name?: string;
  startAt: Date;
  endAt: Date;
}

export interface IUpdateSessionDTO {
  name?: string;
  startAt?: Date;
  endAt?: Date;
  status?: string;
}

export interface ISessionService {
  createSession(data: ICreateSessionDTO): Promise<ISession>;
  getSessionsByExamId(examId: string): Promise<ISession[]>;
  getSessionById(sessionId: string): Promise<ISession>;
  updateSession(sessionId: string, data: IUpdateSessionDTO): Promise<ISession>;
  deleteSession(sessionId: string): Promise<void>;
  finalizeCandidates(sessionId: string): Promise<ISession>;
}
