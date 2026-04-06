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
export declare const FollowUserSchema: z.ZodObject<{
    targetId: z.ZodString;
}, z.core.$strip>;
/**
 * Unfollow User Schema
 */
export declare const UnfollowUserSchema: z.ZodObject<{
    targetId: z.ZodString;
}, z.core.$strip>;
/**
 * Block User Schema
 */
export declare const BlockUserSchema: z.ZodObject<{
    blockedUserId: z.ZodString;
}, z.core.$strip>;
/**
 * Unblock User Schema
 */
export declare const UnblockUserSchema: z.ZodObject<{
    blockedUserId: z.ZodString;
}, z.core.$strip>;
/**
 * Publish Activity Schema
 */
export declare const PublishActivitySchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<typeof ActivityType>;
    refId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>>;
}, z.core.$strip>;
/**
 * Social Feed Query Schema
 */
export declare const SocialFeedQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<typeof ActivityType>>;
}, z.core.$strip>;
/**
 * Compare Users Schema
 */
export declare const CompareUsersSchema: z.ZodObject<{
    userA: z.ZodString;
    userB: z.ZodString;
}, z.core.$strip>;
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
