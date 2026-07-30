import { Schema, model, Document } from 'mongoose';
import { SeatStatus } from '../types/seat.types';

export interface ISeat extends Document {
  seatNumber: string;
  row: string;
  column: number;
  status: SeatStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    seatNumber: { type: String, required: true, unique: true },
    row: { type: String, required: true },
    column: { type: Number, required: true },
    status: { 
      type: String, 
      enum: Object.values(SeatStatus), 
      default: SeatStatus.ACTIVE 
    },
  },
  { timestamps: true }
);

export const SeatModel = model<ISeat>('Seat', SeatSchema);
