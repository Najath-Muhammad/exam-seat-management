import { Seat } from '../../seats/types/seat.types';
import { Candidate } from '../../candidates/types/candidate.types';

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  REASSIGNED = 'REASSIGNED',
  SESSION_TRANSFER = 'SESSION_TRANSFER',
  CANCELLED = 'CANCELLED'
}

export interface SeatAssignment {
  _id: string;
  candidateId: Candidate | string;
  sessionId: string;
  seatId: Seat | string;
  assignmentNumber: string;
  status: AssignmentStatus;
  assignedAt: string;
  assignedBy: { _id: string; name: string; email: string };
  reassignedAt?: string;
  reassignedBy?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignSeatRequest {
  candidateId: string;
  seatId: string;
}

export interface ReassignSeatRequest {
  newSeatId: string;
  reason: string;
}

export interface MoveSessionRequest {
  newSessionId: string;
  newSeatId: string;
  reason: string;
}

export interface AutoAssignResult {
  totalCandidates: number;
  alreadyAssigned: number;
  newlyAssigned: number;
  remainingUnassigned: number;
  availableSeatsRemaining: number;
}

export interface InitialAllocationResult {
  totalCandidates: number;
  alreadyAssigned: number;
  newlyAllocated: number;
  unallocated: number;
  status: 'COMPLETE' | 'PARTIAL' | 'NOT_STARTED';
}
