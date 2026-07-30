export enum SeatStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Seat {
  _id: string;
  seatNumber: string;
  row: string;
  column: number;
  status: SeatStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeatRequest {
  seatNumber: string;
  row: string;
  column: number;
  status?: SeatStatus;
}

export interface UpdateSeatRequest {
  seatNumber?: string;
  row?: string;
  column?: number;
  status?: SeatStatus;
}

export interface GenerateSeatsRequest {
  rows: number;
  seatsPerRow: number;
}

export interface GenerateSeatsResult {
  requested: number;
  created: number;
  skipped: number;
  skippedSeats: string[];
}

export interface SeatListResponse {
  seats: Seat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
