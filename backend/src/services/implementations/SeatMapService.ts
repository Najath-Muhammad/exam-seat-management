import { ISeatMapService, ISeatMapData } from '../interfaces/ISeatMapService';
import { ISeatMapItem, ISeatMapSummary, IRecoveryStatus } from '../../types/seatMap.types';
import { ISeatAssignmentRepository } from '../../repositories/interfaces/ISeatAssignmentRepository';
import { ICandidateRepository } from '../../repositories/interfaces/ICandidateRepository';
import { ISeatRepository } from '../../repositories/interfaces/ISeatRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { NotFoundError } from '../../errors';
import { AssignmentStatus } from '../../types/seatAssignment.types';
import { SeatStatus } from '../../types/seat.types';

export class SeatMapService implements ISeatMapService {
  constructor(
    private readonly assignmentRepository: ISeatAssignmentRepository,
    private readonly candidateRepository: ICandidateRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async getSeatMap(sessionId: string): Promise<ISeatMapData> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const [{ seats: allSeats }, { candidates: allCandidates }, allAssignments] = await Promise.all([
      this.seatRepository.findAll(0, 10000),
      this.candidateRepository.findBySessionId(sessionId, 0, 10000),
      this.assignmentRepository.findBySessionId(sessionId)
    ]);

    const activeAssignments = allAssignments.filter(a => a.status === AssignmentStatus.ASSIGNED);
    
    
    const assignmentBySeatId = new Map(activeAssignments.map(a => [(a.seatId as any)._id.toString(), a]));
    const candidateById = new Map(allCandidates.map(c => [c._id.toString(), c]));
    const assignedCandidateIds = new Set(activeAssignments.map(a => (a.candidateId as any)._id.toString()));

    let occupiedSeats = 0;
    let vacantSeats = 0;
    let maintenanceSeats = 0;
    let inactiveSeats = 0;

    const mapItems: ISeatMapItem[] = allSeats.map(seat => {
      const seatIdStr = seat._id.toString();
      const assignment = assignmentBySeatId.get(seatIdStr);
      let mapStatus: ISeatMapItem['mapStatus'];

      if (seat.status === SeatStatus.INACTIVE) {
        mapStatus = 'INACTIVE';
        inactiveSeats++;
      } else if (seat.status === SeatStatus.MAINTENANCE) {
        mapStatus = 'MAINTENANCE';
        maintenanceSeats++;
      } else if (assignment) {
        mapStatus = 'OCCUPIED';
        occupiedSeats++;
      } else {
        mapStatus = 'VACANT';
        vacantSeats++;
      }

      let item: ISeatMapItem = {
        seatId: seatIdStr,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        physicalStatus: seat.status,
        mapStatus
      };

      if (assignment) {
        const candidateIdStr = (assignment.candidateId as any)._id.toString();
        const cand = candidateById.get(candidateIdStr) || (assignment.candidateId as any);
        
        item.candidate = {
          candidateId: cand._id.toString(),
          registrationNumber: cand.registrationNumber,
          name: cand.name
        };
        
        item.assignment = {
          assignmentId: assignment._id.toString(),
          assignmentNumber: assignment.assignmentNumber,
          assignedAt: assignment.assignedAt,
          assignedBy: (assignment.assignedBy as any).name || (assignment.assignedBy as any).toString()
        };
      }

      return item;
    });

    const unassignedCandidates = allCandidates.filter(c => !assignedCandidateIds.has(c._id.toString()));

    const summary: ISeatMapSummary = {
      totalSeats: allSeats.length,
      occupiedSeats,
      vacantSeats,
      maintenanceSeats,
      inactiveSeats,
      totalCandidates: allCandidates.length,
      assignedCandidates: assignedCandidateIds.size,
      unassignedCandidates: unassignedCandidates.length
    };

    return {
      seats: mapItems,
      summary,
      unassignedCandidates
    };
  }

  async getRecoveryStatus(sessionId: string): Promise<IRecoveryStatus> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const [{ seats: allSeats }, { candidates: allCandidates }, allAssignments] = await Promise.all([
      this.seatRepository.findAll(0, 10000),
      this.candidateRepository.findBySessionId(sessionId, 0, 10000),
      this.assignmentRepository.findBySessionId(sessionId)
    ]);

    const activeAssignments = allAssignments.filter(a => a.status === AssignmentStatus.ASSIGNED);
    const issues: string[] = [];
    let isConsistent = true;

    const candidateCounts = new Map<string, number>();
    const seatCounts = new Map<string, number>();

    const candidateIds = new Set(allCandidates.map(c => c._id.toString()));
    const seatMap = new Map(allSeats.map(s => [s._id.toString(), s]));

    for (const a of activeAssignments) {
      const candId = (a.candidateId as any)._id.toString();
      const stId = (a.seatId as any)._id.toString();

      candidateCounts.set(candId, (candidateCounts.get(candId) || 0) + 1);
      seatCounts.set(stId, (seatCounts.get(stId) || 0) + 1);

      if (!candidateIds.has(candId)) {
        isConsistent = false;
        issues.push(`Assignment ${a.assignmentNumber} points to candidate ${candId} who is not in this session or does not exist.`);
      }

      const physicalSeat = seatMap.get(stId);
      if (!physicalSeat) {
        isConsistent = false;
        issues.push(`Assignment ${a.assignmentNumber} points to non-existent seat ${stId}.`);
      } else if (physicalSeat.status !== SeatStatus.ACTIVE) {
        isConsistent = false;
        issues.push(`Assignment ${a.assignmentNumber} points to seat ${physicalSeat.seatNumber} which is currently ${physicalSeat.status}.`);
      }
    }

    for (const [candId, count] of candidateCounts.entries()) {
      if (count > 1) {
        isConsistent = false;
        issues.push(`Candidate ${candId} has ${count} active assignments in this session.`);
      }
    }

    for (const [stId, count] of seatCounts.entries()) {
      if (count > 1) {
        isConsistent = false;
        issues.push(`Seat ${seatMap.get(stId)?.seatNumber || stId} has ${count} active candidates in this session.`);
      }
    }

    const assignedCount = candidateCounts.size;
    const occupiedCount = seatCounts.size;
    
    
    const activeSeatCount = allSeats.filter(s => s.status === SeatStatus.ACTIVE).length;
    const vacantCount = Math.max(0, activeSeatCount - occupiedCount);
    const unassignedCount = Math.max(0, allCandidates.length - assignedCount);

    return {
      isConsistent,
      issues,
      assignedCount,
      unassignedCount,
      occupiedCount,
      vacantCount
    };
  }
}
