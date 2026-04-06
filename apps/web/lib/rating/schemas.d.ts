/**
 * Rating Engine Zod Schemas
 * Validation schemas for Rating Engine API endpoints
 * v0.38.1 - AI Universal Rating Engine
 */
import { z } from 'zod';
/**
 * Create Rating Request Schema
 */
export declare const CreateRatingRequestSchema: z.ZodObject<{
    category: z.ZodEnum<{
        [x: string]: string;
    }>;
    imageUrl: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateRatingRequestInput = z.infer<typeof CreateRatingRequestSchema>;
