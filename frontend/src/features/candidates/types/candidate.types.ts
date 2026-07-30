export enum CandidateStatus {
  REGISTERED = 'REGISTERED',
  ASSIGNED = 'ASSIGNED',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  COMPLETED = 'COMPLETED',
  DISQUALIFIED = 'DISQUALIFIED',
}

export interface Candidate {
  _id: string;
  registrationNumber: string;
  name: string;
  email?: string;
  phone?: string;
  sessionId: string;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateRequest {
  registrationNumber: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateCandidateRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: CandidateStatus;
}

export interface CandidateListResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  errors: { row: number; registrationNumber: string; error: string }[];
}
