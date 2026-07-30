import { ISeat } from '../../models/Seat';import { TAny } from '../../types/any';


export interface ISeatRepository {
  create(seatData: Partial<ISeat>): Promise<ISeat>;
  createMany(seatsData: Partial<ISeat>[]): Promise<ISeat[]>;
  findById(id: string): Promise<ISeat | null>;
  findBySeatNumber(seatNumber: string): Promise<ISeat | null>;
  findAll(skip?: number, limit?: number, query?: TAny): Promise<{ seats: ISeat[], total: number }>;
  update(id: string, updateData: Partial<ISeat>): Promise<ISeat | null>;
  delete(id: string): Promise<boolean>;
  existsBySeatNumber(seatNumber: string): Promise<boolean>;
  findExistingSeatNumbers(seatNumbers: string[]): Promise<string[]>;
}
