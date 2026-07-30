import { ISeatAssignment } from '../../models/SeatAssignment';
import { ClientSession } from 'mongoose';

export interface ISeatAssignmentRepository {
  create(data: Partial<ISeatAssignment>, session?: ClientSession): Promise<ISeatAssignment>;
  createMany(data: Partial<ISeatAssignment>[], session?: ClientSession): Promise<ISeatAssignment[]>;
  findById(id: string): Promise<ISeatAssignment | null>;
  findActiveByCandidateAndSession(candidateId: string, sessionId: string): Promise<ISeatAssignment | null>;
  findActiveBySeatAndSession(seatId: string, sessionId: string): Promise<ISeatAssignment | null>;
  findBySessionId(sessionId: string): Promise<ISeatAssignment[]>;
  findByCandidateId(candidateId: string): Promise<ISeatAssignment[]>;
  update(id: string, updateData: Partial<ISeatAssignment>, session?: ClientSession): Promise<ISeatAssignment | null>;
  updateMany(query: any, updateData: any, session?: ClientSession): Promise<any>;
}
