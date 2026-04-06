/**
 * World Chronicle Zod Schemas
 * Validation schemas for World Chronicle API endpoints
 * v0.36.43 - World Chronicle 2.0
 */
import { z } from 'zod';
/**
 * Generate Chronicle Schema (Admin)
 */
export declare const GenerateChronicleSchema: z.ZodObject<{
    seasonId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    weekNumber: z.ZodNumber;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, z.core.$strip>;
/**
 * Preview Chronicle Schema (Admin)
 */
export declare const PreviewChronicleSchema: z.ZodObject<{
    seasonId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    weekNumber: z.ZodNumber;
    startDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type GenerateChronicleInput = z.infer<typeof GenerateChronicleSchema>;
export type PreviewChronicleInput = z.infer<typeof PreviewChronicleSchema>;
