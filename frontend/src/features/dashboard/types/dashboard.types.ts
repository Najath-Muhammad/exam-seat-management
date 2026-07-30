export enum HistoryAction {
  INITIAL_ASSIGNMENT = 'INITIAL_ASSIGNMENT',
  SEAT_REASSIGNED = 'SEAT_REASSIGNED',
  SESSION_MOVED = 'SESSION_MOVED',
  ASSIGNMENT_CANCELLED = 'ASSIGNMENT_CANCELLED'
}

export interface IRecentActivity {
  candidateName: string;
  registrationNumber: string;
  action: HistoryAction;
  oldSeatNumber?: string;
  newSeatNumber?: string;
  oldSessionName?: string;
  newSessionName?: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
}

export interface IDashboardData {
  overview: {
    totalExams: number;
    totalSessions: number;
    totalCandidates: number;
    totalSeats: number;
  };
  candidates: {
    assigned: number;
    unassigned: number;
  };
  seats: {
    occupied: number;
    vacant: number;
    maintenance: number;
    inactive: number;
  };
  activity: IRecentActivity[];
  system: {
    database: string;
    consistencyStatus: string;
    issueCount: number;
  };
}

export interface IAssignmentHistory {
  _id: string;
  candidateId: { _id: string; name: string; registrationNumber: string; };
  examId: string;
  oldSessionId?: { _id: string; name: string; sessionNumber: number; };
  newSessionId?: { _id: string; name: string; sessionNumber: number; };
  oldSeatId?: { _id: string; seatNumber: string; row: number; column: number; };
  newSeatId?: { _id: string; seatNumber: string; row: number; column: number; };
  action: HistoryAction;
  reason: string;
  performedBy: { _id: string; firstName: string; lastName: string; email: string; };
  createdAt: string;
}

export interface IHistoryResponse {
  data: IAssignmentHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
