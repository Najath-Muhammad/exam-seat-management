import { ISeatRepository } from '../interfaces/ISeatRepository';
import { SeatModel, ISeat } from '../../models/Seat';

export class SeatRepository implements ISeatRepository {
  async create(seatData: Partial<ISeat>): Promise<ISeat> {
    const seat = new SeatModel(seatData);
    return seat.save();
  }

  async createMany(seatsData: Partial<ISeat>[]): Promise<ISeat[]> {
    return SeatModel.insertMany(seatsData) as any;
  }

  async findById(id: string): Promise<ISeat | null> {
    return SeatModel.findById(id).exec();
  }

  async findBySeatNumber(seatNumber: string): Promise<ISeat | null> {
    return SeatModel.findOne({ seatNumber }).exec();
  }

  async findAll(skip: number = 0, limit: number = 50, query: any = {}): Promise<{ seats: ISeat[], total: number }> {
    const [seats, total] = await Promise.all([
      SeatModel.find(query).sort({ seatNumber: 1 }).skip(skip).limit(limit).exec(),
      SeatModel.countDocuments(query).exec()
    ]);
    return { seats, total };
  }

  async update(id: string, updateData: Partial<ISeat>): Promise<ISeat | null> {
    return SeatModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await SeatModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async existsBySeatNumber(seatNumber: string): Promise<boolean> {
    const count = await SeatModel.countDocuments({ seatNumber }).exec();
    return count > 0;
  }

  async findExistingSeatNumbers(seatNumbers: string[]): Promise<string[]> {
    const existing = await SeatModel.find({ seatNumber: { $in: seatNumbers } }, { seatNumber: 1 }).exec();
    return existing.map(seat => seat.seatNumber);
  }
}
