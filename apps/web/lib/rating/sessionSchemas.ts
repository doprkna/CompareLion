/**
 * Rating Session Zod Schemas
 * Validation schemas for Rating Session API endpoints
 * v0.38.17 - Batch Rating Mode
 */

import { z } from 'zod';

export const StartSessionSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  totalItems: z.number().int().min(5).max(20, 'Total items must be between 5 and 20'),
});

export const CompleteItemSchema = z.object({
  sessionItemId: z.string().min(1, 'Session item ID is required'),
  requestId: z.string().nullable().optional(),
  skipped: z.boolean().optional().default(false),
});

export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type CompleteItemInput = z.infer<typeof CompleteItemSchema>;

