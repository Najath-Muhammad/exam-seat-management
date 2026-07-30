import mongoose from 'mongoose';
import { IInitialAllocationService, IInitialAllocationResult } from '../interfaces/IInitialAllocationService';
import { ISeatAssignmentRepository } from '../../repositories/interfaces/ISeatAssignmentRepository';
import { ICandidateRepository } from '../../repositories/interfaces/ICandidateRepository';
import { ISeatRepository } from '../../repositories/interfaces/ISeatRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { NotFoundError, ConflictError } from '../../errors';
import { AssignmentStatus } from '../../types/seatAssignment.types';
import { SeatStatus } from '../../types/seat.types';import { TAny } from '../../types/any';


export class InitialAllocationService implements IInitialAllocationService {
  constructor(
    private readonly assignmentRepository: ISeatAssignmentRepository,
    private readonly candidateRepository: ICandidateRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  async runInitialAllocation(sessionId: string, adminId: string): Promise<IInitialAllocationResult> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const { candidates } = await this.candidateRepository.findBySessionId(sessionId, 0, 10000);
    const assignments = await this.assignmentRepository.findBySessionId(sessionId);
    const activeAssignments = assignments.filter(a => a.status === AssignmentStatus.ASSIGNED);
    const assignedCandidateIds = new Set(activeAssignments.map(a => (a.candidateId as TAny)._id.toString()));
    const occupiedSeatIds = new Set(activeAssignments.map(a => (a.seatId as TAny)._id.toString()));

    const unassignedCandidates = candidates.filter(c => !assignedCandidateIds.has(c._id.toString()));
    
    const { seats: activeSeats } = await this.seatRepository.findAll(0, 10000, { status: SeatStatus.ACTIVE });
    const availableSeats = activeSeats.filter(s => !occupiedSeatIds.has(s._id.toString()));

    const totalCandidates = candidates.length;
    const alreadyAssigned = assignedCandidateIds.size;
    let newlyAllocated = 0;
    
    if (unassignedCandidates.length === 0) {
      return { 
        totalCandidates, 
        alreadyAssigned, 
        newlyAllocated: 0, 
        unallocated: 0, 
        status: 'COMPLETE' 
      };
    }

    
    unassignedCandidates.sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));

    
    availableSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

    const assignmentsToCreate = [];
    const minLen = Math.min(unassignedCandidates.length, availableSeats.length);

    for (let i = 0; i < minLen; i++) {
      const candidate = unassignedCandidates[i];
      const seat = availableSeats[i];
      assignmentsToCreate.push({
        candidateId: candidate._id as TAny,
        sessionId: session._id as TAny,
        seatId: seat._id as TAny,
        assignmentNumber: `S${session.sessionNumber}-${seat.seatNumber}`,
        status: AssignmentStatus.ASSIGNED,
        assignedBy: adminId as TAny
      });
    }

    if (assignmentsToCreate.length > 0) {
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();
      try {
        await this.assignmentRepository.createMany(assignmentsToCreate, dbSession);
        await dbSession.commitTransaction();
        newlyAllocated = assignmentsToCreate.length;
      } catch (error: TAny) {
        await dbSession.abortTransaction();
        if (error.code === 11000) {
          throw new ConflictError('Concurrency error during initial allocation. Please try again.');
        }
        throw error;
      } finally {
        dbSession.endSession();
      }
    }

    const unallocated = unassignedCandidates.length - newlyAllocated;

    return {
      totalCandidates,
      alreadyAssigned,
      newlyAllocated,
      unallocated,
      status: unallocated === 0 ? 'COMPLETE' : 'PARTIAL'
    };
  }
}
