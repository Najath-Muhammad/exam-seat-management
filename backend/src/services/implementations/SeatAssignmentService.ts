import mongoose from 'mongoose';
import { ISeatAssignmentService, IAssignSeatDTO, IReassignSeatDTO, ICancelAssignmentDTO, IMoveSessionDTO, IAutoAssignResult } from '../interfaces/ISeatAssignmentService';
import { ISeatAssignmentRepository } from '../../repositories/interfaces/ISeatAssignmentRepository';
import { ICandidateRepository } from '../../repositories/interfaces/ICandidateRepository';
import { ISeatRepository } from '../../repositories/interfaces/ISeatRepository';
import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { IAssignmentHistoryRepository } from '../../repositories/interfaces/IAssignmentHistoryRepository';
import { ISeatAssignment } from '../../models/SeatAssignment';
import { ISeat } from '../../models/Seat';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';
import { AssignmentStatus } from '../../types/seatAssignment.types';
import { SeatStatus } from '../../types/seat.types';
import { SessionStatus } from '../../types/session.types';
import { HistoryAction } from '../../types/assignmentHistory.types';
import { emitEvent } from '../../socket';import { TAny } from '../../types/any';


export class SeatAssignmentService implements ISeatAssignmentService {
  constructor(
    private readonly assignmentRepository: ISeatAssignmentRepository,
    private readonly candidateRepository: ICandidateRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly historyRepository: IAssignmentHistoryRepository
  ) {}

  async assignSeat(data: IAssignSeatDTO): Promise<ISeatAssignment> {
    const session = await this.sessionRepository.findById(data.sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const candidate = await this.candidateRepository.findById(data.candidateId);
    if (!candidate) throw new NotFoundError('Candidate not found');
    if (candidate.sessionId.toString() !== data.sessionId) {
      throw new BadRequestError('Candidate does not belong to this session');
    }

    const seat = await this.seatRepository.findById(data.seatId);
    if (!seat) throw new NotFoundError('Seat not found');
    if (seat.status !== SeatStatus.ACTIVE) {
      throw new BadRequestError(`Seat is ${seat.status} and cannot be assigned`);
    }

    const existingCandidateAssig = await this.assignmentRepository.findActiveByCandidateAndSession(data.candidateId, data.sessionId);
    if (existingCandidateAssig) {
      throw new ConflictError('Candidate is already assigned to a seat in this session');
    }

    const existingSeatAssig = await this.assignmentRepository.findActiveBySeatAndSession(data.seatId, data.sessionId);
    if (existingSeatAssig) {
      throw new ConflictError('Seat is already occupied in this session');
    }

    const assignmentNumber = `S${session.sessionNumber}-${seat.seatNumber}`;

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    try {
      const assignment = await this.assignmentRepository.create({
        candidateId: data.candidateId as TAny,
        sessionId: data.sessionId as TAny,
        seatId: data.seatId as TAny,
        assignmentNumber,
        status: AssignmentStatus.ASSIGNED,
        assignedBy: data.adminId as TAny
      }, dbSession);

      await this.historyRepository.create({
        candidateId: candidate._id as TAny,
        examId: session.examId as TAny,
        newSessionId: session._id as TAny,
        newSeatId: seat._id as TAny,
        action: HistoryAction.INITIAL_ASSIGNMENT,
        reason: 'Manual Initial Assignment',
        performedBy: data.adminId as TAny
      }, dbSession);

      await dbSession.commitTransaction();

      emitEvent('SEAT_ASSIGNED', {
        examId: session.examId,
        sessionId: session._id,
        candidateId: candidate._id,
        seatId: seat._id,
      });

      emitEvent('SEAT_ASSIGNED', {
        examId: session.examId,
        sessionId: session._id,
        candidateId: candidate._id,
        seatId: seat._id,
      });

      return assignment;
    } catch (error: TAny) {
      await dbSession.abortTransaction();
      if (error.code === 11000) {
        throw new ConflictError('Concurrency error: Candidate or Seat was just assigned.');
      }
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  async getSessionAssignments(sessionId: string): Promise<ISeatAssignment[]> {
    return this.assignmentRepository.findBySessionId(sessionId);
  }

  async getAvailableSeats(sessionId: string): Promise<ISeat[]> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const { seats: activeSeats } = await this.seatRepository.findAll(0, 10000, { status: SeatStatus.ACTIVE });
    const assignments = await this.assignmentRepository.findBySessionId(sessionId);
    const activeAssignments = assignments.filter(a => a.status === AssignmentStatus.ASSIGNED);
    const occupiedSeatIds = new Set(activeAssignments.map(a => (a.seatId as TAny)._id.toString()));

    return activeSeats.filter(seat => !occupiedSeatIds.has(seat._id.toString()));
  }

  async getCandidateAssignment(candidateId: string): Promise<ISeatAssignment[]> {
    return this.assignmentRepository.findByCandidateId(candidateId);
  }

  async reassignSeat(data: IReassignSeatDTO): Promise<ISeatAssignment> {
    const oldAssignment = await this.assignmentRepository.findById(data.assignmentId);
    if (!oldAssignment) throw new NotFoundError('Assignment not found');
    if (oldAssignment.status !== AssignmentStatus.ASSIGNED) {
      throw new BadRequestError('Only active assignments can be reassigned');
    }

    if (oldAssignment.seatId.toString() === data.newSeatId) {
      throw new BadRequestError('New seat must be different from the current seat');
    }

    const newSeat = await this.seatRepository.findById(data.newSeatId);
    if (!newSeat) throw new NotFoundError('New seat not found');
    if (newSeat.status !== SeatStatus.ACTIVE) {
      throw new BadRequestError(`New seat is ${newSeat.status} and cannot be assigned`);
    }

    const existingSeatAssig = await this.assignmentRepository.findActiveBySeatAndSession(data.newSeatId, oldAssignment.sessionId.toString());
    if (existingSeatAssig) {
      throw new ConflictError('New seat is already occupied in this session');
    }

    const session = await this.sessionRepository.findById(oldAssignment.sessionId.toString());
    const assignmentNumber = `S${session!.sessionNumber}-${newSeat.seatNumber}`;

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    try {
      await this.assignmentRepository.update(data.assignmentId, {
        status: AssignmentStatus.REASSIGNED,
        reassignedAt: new Date(),
        reassignedBy: data.adminId as TAny,
        reason: data.reason
      }, dbSession);

      const newAssignment = await this.assignmentRepository.create({
        candidateId: oldAssignment.candidateId,
        sessionId: oldAssignment.sessionId,
        seatId: data.newSeatId as TAny,
        assignmentNumber,
        status: AssignmentStatus.ASSIGNED,
        assignedBy: data.adminId as TAny
      }, dbSession);

      await this.historyRepository.create({
        candidateId: oldAssignment.candidateId as TAny,
        examId: session!.examId as TAny,
        oldSessionId: oldAssignment.sessionId as TAny,
        newSessionId: oldAssignment.sessionId as TAny,
        oldSeatId: oldAssignment.seatId as TAny,
        newSeatId: newSeat._id as TAny,
        action: HistoryAction.SEAT_REASSIGNED,
        reason: data.reason,
        performedBy: data.adminId as TAny
      }, dbSession);

      await dbSession.commitTransaction();
      emitEvent('SEAT_REASSIGNED', {
        examId: session!.examId,
        sessionId: oldAssignment.sessionId,
        candidateId: oldAssignment.candidateId,
        oldSeatId: oldAssignment.seatId,
        newSeatId: newSeat._id,
      });

      return newAssignment;
    } catch (error: TAny) {
      await dbSession.abortTransaction();
      if (error.code === 11000) {
        throw new ConflictError('Concurrency error: Seat was just assigned.');
      }
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  async cancelAssignment(data: ICancelAssignmentDTO): Promise<ISeatAssignment> {
    const oldAssignment = await this.assignmentRepository.findById(data.assignmentId);
    if (!oldAssignment) throw new NotFoundError('Assignment not found');
    if (oldAssignment.status !== AssignmentStatus.ASSIGNED) {
      throw new BadRequestError('Only active assignments can be cancelled');
    }

    const session = await this.sessionRepository.findById(oldAssignment.sessionId.toString());

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    try {
      const updated = await this.assignmentRepository.update(data.assignmentId, {
        status: AssignmentStatus.CANCELLED,
        reassignedAt: new Date(),
        reassignedBy: data.adminId as TAny,
        reason: 'Cancelled by admin'
      }, dbSession);

      await this.historyRepository.create({
        candidateId: oldAssignment.candidateId as TAny,
        examId: session!.examId as TAny,
        oldSessionId: oldAssignment.sessionId as TAny,
        oldSeatId: oldAssignment.seatId as TAny,
        action: HistoryAction.ASSIGNMENT_CANCELLED,
        reason: 'Cancelled by admin',
        performedBy: data.adminId as TAny
      }, dbSession);

      await dbSession.commitTransaction();

      emitEvent('ASSIGNMENT_CANCELLED', {
        examId: session!.examId,
        sessionId: oldAssignment.sessionId,
        candidateId: oldAssignment.candidateId,
        seatId: oldAssignment.seatId
      });

      emitEvent('ASSIGNMENT_CANCELLED', {
        examId: session!.examId,
        sessionId: oldAssignment.sessionId,
        candidateId: oldAssignment.candidateId,
        seatId: oldAssignment.seatId
      });

      return updated!;
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  async moveSession(data: IMoveSessionDTO): Promise<ISeatAssignment> {
    const oldAssignment = await this.assignmentRepository.findById(data.assignmentId);
    if (!oldAssignment) throw new NotFoundError('Assignment not found');
    if (oldAssignment.status !== AssignmentStatus.ASSIGNED) {
      throw new BadRequestError('Only active assignments can be moved to another session');
    }

    if (oldAssignment.sessionId.toString() === data.newSessionId) {
      throw new BadRequestError('Use Reassign Seat for moving within the same session');
    }

    const oldSession = await this.sessionRepository.findById(oldAssignment.sessionId.toString());
    const newSession = await this.sessionRepository.findById(data.newSessionId);
    
    if (!newSession) throw new NotFoundError('Target session not found');
    if (oldSession && oldSession.examId.toString() !== newSession.examId.toString()) {
       throw new BadRequestError('Target session must belong to the same Exam');
    }
    if (newSession.status === SessionStatus.COMPLETED) {
      throw new BadRequestError('Cannot move candidate to a completed session');
    }

    const candidate = await this.candidateRepository.findById(oldAssignment.candidateId.toString());
    if (!candidate) throw new NotFoundError('Candidate not found');

    const newSeat = await this.seatRepository.findById(data.newSeatId);
    if (!newSeat) throw new NotFoundError('New seat not found');
    if (newSeat.status !== SeatStatus.ACTIVE) {
      throw new BadRequestError(`New seat is ${newSeat.status} and cannot be assigned`);
    }

    const existingSeatAssig = await this.assignmentRepository.findActiveBySeatAndSession(data.newSeatId, data.newSessionId);
    if (existingSeatAssig) {
      throw new ConflictError('New seat is already occupied in the target session');
    }

    const existingCandidateAssig = await this.assignmentRepository.findActiveByCandidateAndSession(oldAssignment.candidateId.toString(), data.newSessionId);
    if (existingCandidateAssig) {
      throw new ConflictError('Candidate already has an active assignment in the target session');
    }

    const assignmentNumber = `S${newSession.sessionNumber}-${newSeat.seatNumber}`;

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    try {
      await this.candidateRepository.update(candidate._id.toString(), { sessionId: newSession._id as TAny }, dbSession);

      await this.assignmentRepository.update(data.assignmentId, {
        status: AssignmentStatus.SESSION_TRANSFER,
        reassignedAt: new Date(),
        reassignedBy: data.adminId as TAny,
        reason: data.reason
      }, dbSession);

      const newAssignment = await this.assignmentRepository.create({
        candidateId: oldAssignment.candidateId,
        sessionId: newSession._id as TAny,
        seatId: data.newSeatId as TAny,
        assignmentNumber,
        status: AssignmentStatus.ASSIGNED,
        assignedBy: data.adminId as TAny
      }, dbSession);

      await this.historyRepository.create({
        candidateId: oldAssignment.candidateId as TAny,
        examId: newSession.examId as TAny,
        oldSessionId: oldAssignment.sessionId as TAny,
        newSessionId: newSession._id as TAny,
        oldSeatId: oldAssignment.seatId as TAny,
        newSeatId: newSeat._id as TAny,
        action: HistoryAction.SESSION_MOVED,
        reason: data.reason,
        performedBy: data.adminId as TAny
      }, dbSession);

      await dbSession.commitTransaction();
      emitEvent('CANDIDATE_MOVED', {
        examId: newSession.examId,
        oldSessionId: oldAssignment.sessionId,
        newSessionId: newSession._id,
        candidateId: oldAssignment.candidateId,
        oldSeatId: oldAssignment.seatId,
        newSeatId: newSeat._id
      });

      return newAssignment;
    } catch (error: TAny) {
      await dbSession.abortTransaction();
      if (error.code === 11000) {
        throw new ConflictError('Concurrency error: Seat or Candidate was just assigned.');
      }
      throw error;
    } finally {
      dbSession.endSession();
    }
  }

  async autoAssignSeats(sessionId: string, adminId: string): Promise<IAutoAssignResult> {
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
    let newlyAssigned = 0;
    
    if (unassignedCandidates.length === 0) {
      return { totalCandidates, alreadyAssigned, newlyAssigned: 0, remainingUnassigned: 0, availableSeatsRemaining: availableSeats.length };
    }

    const assignmentsToCreate = [];
    const historiesToCreate = [];
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
      historiesToCreate.push({
        candidateId: candidate._id as TAny,
        examId: session.examId as TAny,
        newSessionId: session._id as TAny,
        newSeatId: seat._id as TAny,
        action: HistoryAction.INITIAL_ASSIGNMENT,
        reason: 'Auto Initial Allocation',
        performedBy: adminId as TAny
      });
    }

    if (assignmentsToCreate.length > 0) {
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();
      try {
        await this.assignmentRepository.createMany(assignmentsToCreate, dbSession);
        await this.historyRepository.createMany(historiesToCreate, dbSession);
        await dbSession.commitTransaction();
        newlyAssigned = assignmentsToCreate.length;

        emitEvent('AUTO_ASSIGNED', {
          sessionId,
          newlyAssigned
        });
      } catch (error: TAny) {
        await dbSession.abortTransaction();
        if (error.code === 11000) {
          throw new ConflictError('Concurrency error during auto-assignment. Please try again.');
        }
        throw error;
      } finally {
        dbSession.endSession();
      }
    }

    return {
      totalCandidates,
      alreadyAssigned,
      newlyAssigned,
      remainingUnassigned: unassignedCandidates.length - newlyAssigned,
      availableSeatsRemaining: availableSeats.length - newlyAssigned
    };
  }
}
