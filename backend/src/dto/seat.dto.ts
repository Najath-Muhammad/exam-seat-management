import { z } from 'zod';
import { SeatStatus } from '../types/seat.types';

export const createSeatSchema = z.object({
  body: z.object({
    seatNumber: z.string().min(1, 'Seat number is required'),
    row: z.string().min(1, 'Row is required'),
    column: z.number().int().positive('Column must be a positive integer'),
    status: z.nativeEnum(SeatStatus).optional(),
  }),
});

export const updateSeatSchema = z.object({
  body: z.object({
    seatNumber: z.string().min(1).optional(),
    row: z.string().min(1).optional(),
    column: z.number().int().positive().optional(),
    status: z.nativeEnum(SeatStatus).optional(),
  }),
});

export const generateSeatsSchema = z.object({
  body: z.object({
    rows: z.number().int().positive('Rows must be a positive integer'),
    seatsPerRow: z.number().int().positive('Seats per row must be a positive integer'),
  }),
});
