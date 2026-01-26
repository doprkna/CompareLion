/**
 * World Chronicle Zod Schemas
 * Validation schemas for World Chronicle API endpoints
 * v0.36.43 - World Chronicle 2.0
 */

import { z } from 'zod';

/**
 * Generate Chronicle Schema (Admin)
 */
export const GenerateChronicleSchema = z.object({
  seasonId: z.string().optional().nullable(),
  weekNumber: z.number().int().min(1).max(53),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
}).refine(data => {
  const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
  const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * Preview Chronicle Schema (Admin)
 */
export const PreviewChronicleSchema = z.object({
  seasonId: z.string().optional().nullable(),
  weekNumber: z.number().int().min(1).max(53),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
}).refine(data => {
  const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
  const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
  return endDate > startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * Type exports for TypeScript
 */
export type GenerateChronicleInput = z.infer<typeof GenerateChronicleSchema>;
export type PreviewChronicleInput = z.infer<typeof PreviewChronicleSchema>;

