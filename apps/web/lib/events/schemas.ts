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
export const CreateEventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).optional().nullable(),
  type: z.nativeEnum(EventType),
  startAt: z.string().datetime().or(z.date()),
  endAt: z.string().datetime().or(z.date()),
  icon: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
}).refine(data => {
  const startAt = typeof data.startAt === 'string' ? new Date(data.startAt) : data.startAt;
  const endAt = typeof data.endAt === 'string' ? new Date(data.endAt) : data.endAt;
  return endAt > startAt;
}, {
  message: 'End date must be after start date',
  path: ['endAt'],
});

/**
 * Update Event Schema (Admin)
 */
export const UpdateEventSchema = CreateEventSchema.partial().extend({
  active: z.boolean().optional(),
});

/**
 * Create Event Effect Schema (Admin)
 */
export const CreateEventEffectSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  effectType: z.nativeEnum(EventEffectType),
  value: z.number().min(0, 'Value must be >= 0'),
  target: z.nativeEnum(EffectTarget).default(EffectTarget.GLOBAL),
  description: z.string().max(200).optional().nullable(),
});

/**
 * Update Event Effect Schema (Admin)
 */
export const UpdateEventEffectSchema = CreateEventEffectSchema.partial().omit({ eventId: true });

/**
 * Activate Event Schema (Admin)
 */
export const ActivateEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

/**
 * Deactivate Event Schema (Admin)
 */
export const DeactivateEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
});

/**
 * Type exports for TypeScript
 */
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type CreateEventEffectInput = z.infer<typeof CreateEventEffectSchema>;
export type UpdateEventEffectInput = z.infer<typeof UpdateEventEffectSchema>;
export type ActivateEventInput = z.infer<typeof ActivateEventSchema>;
export type DeactivateEventInput = z.infer<typeof DeactivateEventSchema>;

