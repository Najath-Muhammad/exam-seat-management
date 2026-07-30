import { z } from 'zod';
import { mongoIdSchema } from './common.dto';

export const assignSeatSchema = z.object({
  body: z.object({
    candidateId: mongoIdSchema,
    seatId: mongoIdSchema,
  }),
});

export const reassignSeatSchema = z.object({
  body: z.object({
    newSeatId: mongoIdSchema,
    reason: z.string().min(1, 'Reason for reassignment is required'),
  }),
});

export const moveSessionSchema = z.object({
  body: z.object({
    newSessionId: mongoIdSchema,
    newSeatId: mongoIdSchema,
    reason: z.string().min(1, 'Reason for session movement is required'),
  }),
});
