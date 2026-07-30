import { IDashboardService, IDashboardData, IRecentActivity } from '../interfaces/IDashboardService';
import { ISeatRepository } from '../../repositories/interfaces/ISeatRepository';
import { ISeatAssignmentRepository } from '../../repositories/interfaces/ISeatAssignmentRepository';
import { IAssignmentHistoryRepository } from '../../repositories/interfaces/IAssignmentHistoryRepository';
import { AssignmentStatus } from '../../types/seatAssignment.types';
import { SeatStatus } from '../../types/seat.types';
import { ExamModel } from '../../models/Exam';
import { SessionModel } from '../../models/Session';
import { CandidateModel } from '../../models/Candidate';import { TAny } from '../../types/any';


export class DashboardService implements IDashboardService {
  constructor(
    private readonly seatRepository: ISeatRepository,
    private readonly assignmentRepository: ISeatAssignmentRepository,
    private readonly historyRepository: IAssignmentHistoryRepository
  ) {}

  async getDashboardData(examId?: string, sessionId?: string): Promise<IDashboardData> {
    
    
    const totalExams = await ExamModel.countDocuments();
    
    let sessionFilter = {};
    if (examId) sessionFilter = { examId };
    if (sessionId) sessionFilter = { _id: sessionId };
    const sessions = await SessionModel.find(sessionFilter).exec();
    const totalSessions = sessions.length;

    const validSessionIds = sessions.map(s => s._id.toString());

    let candidateFilter: TAny = {};
    if (sessionId) {
      candidateFilter = { sessionId };
    } else if (examId) {
      candidateFilter = { sessionId: { $in: validSessionIds } };
    }

    const totalCandidates = await CandidateModel.countDocuments(candidateFilter);
    const { seats, total: totalSeats } = await this.seatRepository.findAll(0, 100000);

    
    const allAssignmentsPromises = validSessionIds.map(sId => this.assignmentRepository.findBySessionId(sId));
    const allAssignmentsArrays = await Promise.all(allAssignmentsPromises);
    const activeAssignments = allAssignmentsArrays.flat().filter(a => a.status === AssignmentStatus.ASSIGNED);

    const assignedCandidateIds = new Set(activeAssignments.map(a => (a.candidateId as TAny)._id.toString()));
    const assignedSeatsIds = new Set(activeAssignments.map(a => (a.seatId as TAny)._id.toString()));

    const assigned = assignedCandidateIds.size;
    const unassigned = totalCandidates - assigned;

    const occupied = activeAssignments.length;
    const vacant = seats.filter(s => s.status === SeatStatus.ACTIVE && !assignedSeatsIds.has(s._id.toString())).length;
    const maintenance = seats.filter(s => s.status === SeatStatus.MAINTENANCE).length;
    const inactive = seats.filter(s => s.status === SeatStatus.INACTIVE).length;

    
    const { data: recentHistory } = await this.historyRepository.findWithPagination(
      { examId, sessionId }, 
      0, 
      10, 
      'createdAt', 
      'desc'
    );

    const activity: IRecentActivity[] = recentHistory.map((h: TAny) => ({
      candidateName: h.candidateId?.name || 'Unknown',
      registrationNumber: h.candidateId?.registrationNumber || 'Unknown',
      action: h.action,
      oldSeatNumber: h.oldSeatId?.seatNumber,
      newSeatNumber: h.newSeatId?.seatNumber,
      oldSessionName: h.oldSessionId?.name,
      newSessionName: h.newSessionId?.name,
      reason: h.reason,
      performedBy: h.performedBy ? `${h.performedBy.firstName} ${h.performedBy.lastName}` : 'System',
      timestamp: h.createdAt
    }));

    const system = {
      database: 'Connected',
      consistencyStatus: 'Consistent',
      issueCount: 0
    };

    return {
      overview: {
        totalExams,
        totalSessions,
        totalCandidates,
        totalSeats
      },
      candidates: {
        assigned,
        unassigned
      },
      seats: {
        occupied,
        vacant,
        maintenance,
        inactive
      },
      activity,
      system
    };
  }
}
