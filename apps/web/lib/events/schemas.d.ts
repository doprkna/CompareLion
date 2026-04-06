/**
 * Events System Zod Schemas
 * Validation schemas for Events System API endpoints
 * v0.36.41 - Events System 1.0
 */
import { z } from 'zod';
import { EventType, EventEffectType, EffectTarget } from './types';
/**
 * Create Event Schema (Admin)
 */
export declare const CreateEventSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<typeof EventType>;
    startAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    endAt: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    emoji: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update Event Schema (Admin)
 */
export declare const UpdateEventSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    type: z.ZodOptional<z.ZodEnum<typeof EventType>>;
    startAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    endAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    emoji: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Create Event Effect Schema (Admin)
 */
export declare const CreateEventEffectSchema: z.ZodObject<{
    eventId: z.ZodString;
    effectType: z.ZodEnum<typeof EventEffectType>;
    value: z.ZodNumber;
    target: z.ZodDefault<z.ZodEnum<typeof EffectTarget>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Update Event Effect Schema (Admin)
 */
export declare const UpdateEventEffectSchema: z.ZodObject<{
    value: z.ZodOptional<z.ZodNumber>;
    target: z.ZodOptional<z.ZodDefault<z.ZodEnum<typeof EffectTarget>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    effectType: z.ZodOptional<z.ZodEnum<typeof EventEffectType>>;
}, z.core.$strip>;
/**
 * Activate Event Schema (Admin)
 */
export declare const ActivateEventSchema: z.ZodObject<{
    eventId: z.ZodString;
}, z.core.$strip>;
/**
 * Deactivate Event Schema (Admin)
 */
export declare const DeactivateEventSchema: z.ZodObject<{
    eventId: z.ZodString;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type CreateEventEffectInput = z.infer<typeof CreateEventEffectSchema>;
export type UpdateEventEffectInput = z.infer<typeof UpdateEventEffectSchema>;
export type ActivateEventInput = z.infer<typeof ActivateEventSchema>;
export type DeactivateEventInput = z.infer<typeof DeactivateEventSchema>;
