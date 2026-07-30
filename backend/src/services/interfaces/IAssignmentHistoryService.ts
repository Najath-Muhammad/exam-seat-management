import { IAssignmentHistory } from '../../models/AssignmentHistory';
import { IHistoryFilter } from '../../repositories/interfaces/IAssignmentHistoryRepository';

export interface IAssignmentHistoryService {
  getHistory(filter: IHistoryFilter, page: number, limit: number): Promise<{ data: IAssignmentHistory[]; total: number; page: number; limit: number; totalPages: number }>;
  getCandidateHistory(candidateId: string): Promise<IAssignmentHistory[]>;
}
