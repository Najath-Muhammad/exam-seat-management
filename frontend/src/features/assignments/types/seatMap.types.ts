export interface SeatMapItem {
  seatId: string;
  seatNumber: string;
  row: string;
  column: number;
  physicalStatus: string;
  mapStatus: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE' | 'INACTIVE';
  candidate?: {
    candidateId: string;
    registrationNumber: string;
    name: string;
  };
  assignment?: {
    assignmentId: string;
    assignmentNumber: string;
    assignedAt: string;
    assignedBy: string;
  };
}

export interface SeatMapSummary {
  totalSeats: number;
  occupiedSeats: number;
  vacantSeats: number;
  maintenanceSeats: number;
  inactiveSeats: number;
  totalCandidates: number;
  assignedCandidates: number;
  unassignedCandidates: number;
}

export interface SeatMapCandidate {
  _id: string;
  registrationNumber: string;
  name: string;
}

export interface SeatMapData {
  seats: SeatMapItem[];
  summary: SeatMapSummary;
  unassignedCandidates: SeatMapCandidate[];
}

export interface RecoveryStatus {
  isConsistent: boolean;
  issues: string[];
  assignedCount: number;
  unassignedCount: number;
  occupiedCount: number;
  vacantCount: number;
}
