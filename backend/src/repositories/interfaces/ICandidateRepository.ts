import { ICandidate } from '../../models/Candidate';
import { ClientSession } from 'mongoose';

export interface ICandidateRepository {
  create(candidateData: Partial<ICandidate>): Promise<ICandidate>;
  createMany(candidatesData: Partial<ICandidate>[]): Promise<ICandidate[]>;
  findById(id: string): Promise<ICandidate | null>;
  findByRegistrationNumber(regNum: string): Promise<ICandidate | null>;
  findBySessionId(sessionId: string, skip?: number, limit?: number): Promise<{ candidates: ICandidate[], total: number }>;
  update(id: string, updateData: Partial<ICandidate>, session?: ClientSession): Promise<ICandidate | null>;
  delete(id: string): Promise<boolean>;
  countBySessionId(sessionId: string): Promise<number>;
  existsByRegistrationNumber(regNum: string): Promise<boolean>;
}
