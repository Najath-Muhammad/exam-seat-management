export enum SessionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Session {
  _id: string;
  examId: string;
  sessionNumber: number;
  name?: string;
  startAt: string;
  endAt: string;
  status: SessionStatus;
  capacity: number;
  isCandidatesFinalized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  name: string;
  description?: string;
}

export interface CreateSessionRequest {
  sessionNumber: number;
  name?: string;
  startAt: string;
  endAt: string;
}

export interface UpdateSessionRequest {
  name?: string;
  startAt?: string;
  endAt?: string;
  status?: SessionStatus;
}
