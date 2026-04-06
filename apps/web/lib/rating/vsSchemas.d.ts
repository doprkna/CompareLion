/**
 * VS Mode Zod Schemas
 * Validation schemas for VS Mode API endpoints
 * v0.38.16 - VS Mode
 */
import { z } from 'zod';
export declare const CreateVsRequestSchema: z.ZodObject<{
    leftImageUrl: z.ZodString;
    rightImageUrl: z.ZodString;
    category: z.ZodString;
}, z.core.$strip>;
export declare const VoteVsSchema: z.ZodObject<{
    vsId: z.ZodString;
    choice: z.ZodEnum<{
        right: "right";
        left: "left";
    }>;
}, z.core.$strip>;
export type CreateVsRequestInput = z.infer<typeof CreateVsRequestSchema>;
export type VoteVsInput = z.infer<typeof VoteVsSchema>;
