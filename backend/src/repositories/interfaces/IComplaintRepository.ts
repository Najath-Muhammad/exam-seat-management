import { IComplaint } from '../../models/Complaint';

export interface IComplaintRepository {
  create(data: Partial<IComplaint>): Promise<IComplaint>;
  findById(id: string): Promise<IComplaint | null>;
  findByCandidate(candidateId: string): Promise<IComplaint[]>;
  findBySession(sessionId: string): Promise<IComplaint[]>;
  findAll(): Promise<IComplaint[]>;
  update(id: string, data: Partial<IComplaint>): Promise<IComplaint | null>;
}
