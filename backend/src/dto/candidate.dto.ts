import { z } from 'zod';
import { CandidateStatus } from '../types/candidate.types';

export const createCandidateSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
  }),
});

export const updateCandidateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    status: z.nativeEnum(CandidateStatus).optional(),
  }),
});
