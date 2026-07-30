export interface ISeatMapItem {
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
    assignedAt: Date;
    assignedBy: string;
  };
}

export interface ISeatMapSummary {
  totalSeats: number;
  occupiedSeats: number;
  vacantSeats: number;
  maintenanceSeats: number;
  inactiveSeats: number;
  totalCandidates: number;
  assignedCandidates: number;
  unassignedCandidates: number;
}

export interface IRecoveryStatus {
  isConsistent: boolean;
  issues: string[];
  assignedCount: number;
  unassignedCount: number;
  occupiedCount: number;
  vacantCount: number;
}
