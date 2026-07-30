import { HistoryAction } from '../../types/assignmentHistory.types';

export interface IDashboardOverview {
  totalExams: number;
  totalSessions: number;
  totalCandidates: number;
  totalSeats: number;
}

export interface IDashboardCandidates {
  assigned: number;
  unassigned: number;
}

export interface IDashboardSeats {
  occupied: number;
  vacant: number;
  maintenance: number;
  inactive: number;
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
  timestamp: Date;
}

export interface ISystemStatus {
  database: string;
  consistencyStatus: string;
  issueCount: number;
}

export interface IDashboardData {
  overview: IDashboardOverview;
  candidates: IDashboardCandidates;
  seats: IDashboardSeats;
  activity: IRecentActivity[];
  system: ISystemStatus;
}

export interface IDashboardService {
  getDashboardData(examId?: string, sessionId?: string): Promise<IDashboardData>;
}
