import { z } from 'zod';
import { SessionStatus } from '../types/session.types';

export const createSessionSchema = z.object({
  body: z.object({
    sessionNumber: z.number().int().positive('Session number must be a positive integer'),
    name: z.string().optional(),
    startAt: z.string().datetime('startAt must be a valid ISO 8601 string'),
    endAt: z.string().datetime('endAt must be a valid ISO 8601 string'),
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    startAt: z.string().datetime('startAt must be a valid ISO 8601 string').optional(),
    endAt: z.string().datetime('endAt must be a valid ISO 8601 string').optional(),
    status: z.nativeEnum(SessionStatus).optional(),
  }),
});
