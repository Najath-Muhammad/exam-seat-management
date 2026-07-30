import { ISeatService, ICreateSeatDTO, IUpdateSeatDTO, IGenerateSeatsDTO, IGenerateSeatsResult } from '../interfaces/ISeatService';
import { ISeatRepository } from '../../repositories/interfaces/ISeatRepository';
import { ISeat } from '../../models/Seat';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors';
import { SeatStatus } from '../../types/seat.types';import { TAny } from '../../types/any';


export class SeatService implements ISeatService {
  constructor(private readonly seatRepository: ISeatRepository) {}

  async createSeat(data: ICreateSeatDTO): Promise<ISeat> {
    const exists = await this.seatRepository.existsBySeatNumber(data.seatNumber);
    if (exists) {
      throw new ConflictError(`Seat number ${data.seatNumber} already exists`);
    }

    return this.seatRepository.create({
      ...data,
      status: (data.status as SeatStatus) || SeatStatus.ACTIVE
    });
  }

  async getSeats(skip: number = 0, limit: number = 50, query: TAny = {}): Promise<{ seats: ISeat[], total: number }> {
    return this.seatRepository.findAll(skip, limit, query);
  }

  async getSeatById(seatId: string): Promise<ISeat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat) throw new NotFoundError('Seat not found');
    return seat;
  }

  async updateSeat(seatId: string, data: IUpdateSeatDTO): Promise<ISeat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat) throw new NotFoundError('Seat not found');

    if (data.seatNumber && data.seatNumber !== seat.seatNumber) {
      const exists = await this.seatRepository.existsBySeatNumber(data.seatNumber);
      if (exists) {
        throw new ConflictError(`Seat number ${data.seatNumber} already exists`);
      }
    }

    const updatePayload = { ...data } as Partial<ISeat>;
    if (data.status) {
      updatePayload.status = data.status as SeatStatus;
    }

    const updated = await this.seatRepository.update(seatId, updatePayload);
    return updated!;
  }

  async deleteSeat(seatId: string): Promise<void> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat) throw new NotFoundError('Seat not found');
    
    
    
    await this.seatRepository.delete(seatId);
  }

  async generateSeats(data: IGenerateSeatsDTO): Promise<IGenerateSeatsResult> {
    if (data.rows <= 0 || data.seatsPerRow <= 0) {
      throw new BadRequestError('Rows and seats per row must be positive integers');
    }

    const requested = data.rows * data.seatsPerRow;
    const generatedSeats: Partial<ISeat>[] = [];
    const seatNumbers: string[] = [];

    
    const getRowLetter = (index: number): string => {
      let letter = '';
      while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
      }
      return letter;
    };

    for (let r = 0; r < data.rows; r++) {
      const rowLabel = getRowLetter(r);
      for (let c = 1; c <= data.seatsPerRow; c++) {
        const colStr = c.toString().padStart(2, '0'); 
        const seatNumber = `${rowLabel}${colStr}`;
        seatNumbers.push(seatNumber);
        generatedSeats.push({
          seatNumber,
          row: rowLabel,
          column: c,
          status: SeatStatus.ACTIVE
        });
      }
    }

    const existingSeatNumbers = await this.seatRepository.findExistingSeatNumbers(seatNumbers);
    
    const validSeatsToCreate = generatedSeats.filter(
      seat => !existingSeatNumbers.includes(seat.seatNumber!)
    );

    if (validSeatsToCreate.length > 0) {
      await this.seatRepository.createMany(validSeatsToCreate);
    }

    return {
      requested,
      created: validSeatsToCreate.length,
      skipped: existingSeatNumbers.length,
      skippedSeats: existingSeatNumbers
    };
  }
}
