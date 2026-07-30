import { IAssignmentHistoryService } from '../interfaces/IAssignmentHistoryService';
import { IAssignmentHistoryRepository, IHistoryFilter } from '../../repositories/interfaces/IAssignmentHistoryRepository';
import { IAssignmentHistory } from '../../models/AssignmentHistory';

export class AssignmentHistoryService implements IAssignmentHistoryService {
  constructor(private readonly historyRepository: IAssignmentHistoryRepository) {}

  async getHistory(filter: IHistoryFilter, page: number = 1, limit: number = 20): Promise<{ data: IAssignmentHistory[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const { data, total } = await this.historyRepository.findWithPagination(filter, skip, limit, 'createdAt', 'desc');
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCandidateHistory(candidateId: string): Promise<IAssignmentHistory[]> {
    return this.historyRepository.findByCandidateId(candidateId);
  }
}
