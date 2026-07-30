import { ClientSession, FilterQuery, SortOrder } from 'mongoose';
import { IAssignmentHistoryRepository, IHistoryFilter } from '../interfaces/IAssignmentHistoryRepository';
import AssignmentHistory, { IAssignmentHistory } from '../../models/AssignmentHistory';

export class AssignmentHistoryRepository implements IAssignmentHistoryRepository {
  async create(data: Partial<IAssignmentHistory>, session?: ClientSession): Promise<IAssignmentHistory> {
    const records = await AssignmentHistory.create([data], { session });
    return records[0];
  }

  async createMany(data: Partial<IAssignmentHistory>[], session?: ClientSession): Promise<IAssignmentHistory[]> {
    return AssignmentHistory.insertMany(data, { session });
  }

  async findByCandidateId(candidateId: string): Promise<IAssignmentHistory[]> {
    return AssignmentHistory.find({ candidateId })
      .populate('oldSessionId newSessionId oldSeatId newSeatId performedBy')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findWithPagination(
    filter: IHistoryFilter,
    skip: number,
    limit: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: IAssignmentHistory[]; total: number }> {
    
    const query: FilterQuery<IAssignmentHistory> = {};

    if (filter.examId) query.examId = filter.examId;
    
    if (filter.sessionId) {
      query.$or = [
        { oldSessionId: filter.sessionId },
        { newSessionId: filter.sessionId }
      ];
    }
    
    if (filter.seatId) {
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ oldSeatId: filter.seatId }, { newSeatId: filter.seatId }] }
        ];
        delete query.$or;
      } else {
        query.$or = [{ oldSeatId: filter.seatId }, { newSeatId: filter.seatId }];
      }
    }

    if (filter.candidateId) query.candidateId = filter.candidateId;
    if (filter.action) query.action = filter.action;
    if (filter.adminId) query.performedBy = filter.adminId;
    
    if (filter.dateFrom || filter.dateTo) {
      query.createdAt = {};
      if (filter.dateFrom) query.createdAt.$gte = filter.dateFrom;
      if (filter.dateTo) query.createdAt.$lte = filter.dateTo;
    }

    const sortOption: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      AssignmentHistory.find(query)
        .populate('candidateId', 'name registrationNumber')
        .populate('oldSessionId', 'name sessionNumber')
        .populate('newSessionId', 'name sessionNumber')
        .populate('oldSeatId', 'seatNumber row column')
        .populate('newSeatId', 'seatNumber row column')
        .populate('performedBy', 'firstName lastName email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      AssignmentHistory.countDocuments(query).exec()
    ]);

    return { data, total };
  }
}
