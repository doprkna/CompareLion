/**
 * Public API Zod Schemas
 * Validation schemas for Public API endpoints
 * v0.38.15 - AURE Public API
 */
import { z } from 'zod';
export declare const PublicRatingRequestSchema: z.ZodObject<{
    apiKey: z.ZodString;
    category: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PublicRatingRequestInput = z.infer<typeof PublicRatingRequestSchema>;
