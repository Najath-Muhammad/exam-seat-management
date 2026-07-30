import { ISeatAssignment } from '../../models/SeatAssignment';
import { ISeat } from '../../models/Seat';

export interface IAssignSeatDTO {
  sessionId: string;
  candidateId: string;
  seatId: string;
  adminId: string;
}

export interface IReassignSeatDTO {
  assignmentId: string;
  newSeatId: string;
  reason: string;
  adminId: string;
}

export interface ICancelAssignmentDTO {
  assignmentId: string;
  adminId: string;
}

export interface IMoveSessionDTO {
  assignmentId: string;
  newSessionId: string;
  newSeatId: string;
  adminId: string;
  reason: string;
}

export interface IAutoAssignResult {
  totalCandidates: number;
  alreadyAssigned: number;
  newlyAssigned: number;
  remainingUnassigned: number;
  availableSeatsRemaining: number;
}

export interface ISeatAssignmentService {
  assignSeat(data: IAssignSeatDTO): Promise<ISeatAssignment>;
  getSessionAssignments(sessionId: string): Promise<ISeatAssignment[]>;
  getAvailableSeats(sessionId: string): Promise<ISeat[]>;
  getCandidateAssignment(candidateId: string): Promise<ISeatAssignment[]>;
  reassignSeat(data: IReassignSeatDTO): Promise<ISeatAssignment>;
  cancelAssignment(data: ICancelAssignmentDTO): Promise<ISeatAssignment>;
  moveSession(data: IMoveSessionDTO): Promise<ISeatAssignment>;
  autoAssignSeats(sessionId: string, adminId: string): Promise<IAutoAssignResult>;
}
