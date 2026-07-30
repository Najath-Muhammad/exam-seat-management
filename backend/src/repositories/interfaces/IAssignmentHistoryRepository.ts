import { ClientSession } from 'mongoose';
import { IAssignmentHistory } from '../../models/AssignmentHistory';
import { HistoryAction } from '../../types/assignmentHistory.types';

export interface IHistoryFilter {
  examId?: string;
  sessionId?: string; // matches either oldSessionId or newSessionId
  candidateId?: string;
  seatId?: string; // matches either oldSeatId or newSeatId
  action?: HistoryAction;
  adminId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IAssignmentHistoryRepository {
  create(data: Partial<IAssignmentHistory>, session?: ClientSession): Promise<IAssignmentHistory>;
  createMany(data: Partial<IAssignmentHistory>[], session?: ClientSession): Promise<IAssignmentHistory[]>;
  findByCandidateId(candidateId: string): Promise<IAssignmentHistory[]>;
  findWithPagination(filter: IHistoryFilter, skip: number, limit: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{ data: IAssignmentHistory[]; total: number }>;
}
