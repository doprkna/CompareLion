/**
 * Public API Zod Schemas
 * Validation schemas for Public API endpoints
 * v0.38.15 - AURE Public API
 */

import { z } from 'zod';

export const PublicRatingRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional(),
  text: z.string().min(1).max(500).optional(),
}).refine(
  (data) => data.imageUrl || data.text,
  {
    message: 'Either imageUrl or text must be provided',
    path: ['imageUrl'],
  }
);

export type PublicRatingRequestInput = z.infer<typeof PublicRatingRequestSchema>;

