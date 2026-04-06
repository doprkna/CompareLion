/**
 * Rating Template Zod Schemas
 * Validation schemas for Template Marketplace API endpoints
 * v0.38.14 - Template Marketplace
 */
import { z } from 'zod';
export declare const CreateTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    categoryLabel: z.ZodString;
    metrics: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    promptTemplate: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodBoolean;
}, z.core.$strip>;
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
