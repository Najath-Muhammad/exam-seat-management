import { ISeat } from '../../models/Seat';import { TAny } from '../../types/any';


export interface ICreateSeatDTO {
  seatNumber: string;
  row: string;
  column: number;
  status?: string;
}

export interface IUpdateSeatDTO {
  seatNumber?: string;
  row?: string;
  column?: number;
  status?: string;
}

export interface IGenerateSeatsDTO {
  rows: number;
  seatsPerRow: number;
}

export interface IGenerateSeatsResult {
  requested: number;
  created: number;
  skipped: number;
  skippedSeats: string[];
}

export interface ISeatService {
  createSeat(data: ICreateSeatDTO): Promise<ISeat>;
  getSeats(skip?: number, limit?: number, query?: TAny): Promise<{ seats: ISeat[], total: number }>;
  getSeatById(seatId: string): Promise<ISeat>;
  updateSeat(seatId: string, data: IUpdateSeatDTO): Promise<ISeat>;
  deleteSeat(seatId: string): Promise<void>;
  generateSeats(data: IGenerateSeatsDTO): Promise<IGenerateSeatsResult>;
}
