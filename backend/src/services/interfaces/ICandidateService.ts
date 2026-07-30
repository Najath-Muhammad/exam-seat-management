import { ICandidate } from '../../models/Candidate';

export interface ICreateCandidateDTO {
  sessionId: string;
  registrationNumber: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface IUpdateCandidateDTO {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface ICandidateService {
  createCandidate(data: ICreateCandidateDTO): Promise<ICandidate>;
  getCandidatesBySession(sessionId: string, skip?: number, limit?: number): Promise<{ candidates: ICandidate[], total: number }>;
  getCandidateById(candidateId: string): Promise<ICandidate>;
  updateCandidate(candidateId: string, data: IUpdateCandidateDTO): Promise<ICandidate>;
  deleteCandidate(candidateId: string): Promise<void>;
  bulkImport(sessionId: string, candidates: Omit<ICreateCandidateDTO, 'sessionId'>[]): Promise<{ imported: number; failed: number; errors: any[] }>;
}
