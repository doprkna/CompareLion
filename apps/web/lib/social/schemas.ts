/**
 * Social Systems Zod Schemas
 * Validation schemas for Social Systems API endpoints
 * v0.36.42 - Social Systems 1.0
 */

import { z } from 'zod';
import { ActivityType } from './types';

/**
 * Follow User Schema
 */
export const FollowUserSchema = z.object({
  targetId: z.string().min(1, 'Target user ID is required'),
});

/**
 * Unfollow User Schema
 */
export const UnfollowUserSchema = z.object({
  targetId: z.string().min(1, 'Target user ID is required'),
});

/**
 * Block User Schema
 */
export const BlockUserSchema = z.object({
  blockedUserId: z.string().min(1, 'Blocked user ID is required'),
});

/**
 * Unblock User Schema
 */
export const UnblockUserSchema = z.object({
  blockedUserId: z.string().min(1, 'Blocked user ID is required'),
});

/**
 * Publish Activity Schema
 */
export const PublishActivitySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.nativeEnum(ActivityType),
  refId: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

/**
 * Social Feed Query Schema
 */
export const SocialFeedQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  userId: z.string().optional(), // Filter by specific user
  type: z.nativeEnum(ActivityType).optional(), // Filter by activity type
});

/**
 * Compare Users Schema
 */
export const CompareUsersSchema = z.object({
  userA: z.string().min(1, 'User A ID is required'),
  userB: z.string().min(1, 'User B ID is required'),
});

/**
 * Type exports for TypeScript
 */
export type FollowUserInput = z.infer<typeof FollowUserSchema>;
export type UnfollowUserInput = z.infer<typeof UnfollowUserSchema>;
export type BlockUserInput = z.infer<typeof BlockUserSchema>;
export type UnblockUserInput = z.infer<typeof UnblockUserSchema>;
export type PublishActivityInput = z.infer<typeof PublishActivitySchema>;
export type SocialFeedQueryInput = z.infer<typeof SocialFeedQuerySchema>;
export type CompareUsersInput = z.infer<typeof CompareUsersSchema>;

