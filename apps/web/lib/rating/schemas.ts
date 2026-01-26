/**
 * Rating Engine Zod Schemas
 * Validation schemas for Rating Engine API endpoints
 * v0.38.1 - AI Universal Rating Engine
 */

import { z } from 'zod';
import { getAllCategories } from './presets';

/**
 * Create Rating Request Schema
 */
export const CreateRatingRequestSchema = z.object({
  category: z.enum(
    getAllCategories() as [string, ...string[]],
    {
      errorMap: () => ({ message: `Category must be one of: ${getAllCategories().join(', ')}` }),
    }
  ),
  imageUrl: z.string().url().optional(),
  text: z.string().min(1).max(500).optional(),
}).refine(
  (data) => data.imageUrl || data.text,
  {
    message: 'Either imageUrl or text must be provided',
    path: ['imageUrl'],
  }
);

export type CreateRatingRequestInput = z.infer<typeof CreateRatingRequestSchema>;

