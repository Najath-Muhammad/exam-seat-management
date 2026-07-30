import { z } from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
  }).optional(),
});

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID');
