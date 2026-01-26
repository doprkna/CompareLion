/**
 * Social Systems Schema Definition
 * 
 * This file documents the Prisma schema structure for Social Systems 1.0
 * Note: Models may already exist (friendship, etc.)
 * 
 * v0.36.42 - Social Systems 1.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. Follow:
 *    - id (String, @id, @default(cuid()))
 *    - followerId (String, relation to User)
 *    - targetId (String, relation to User)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: follower (User), target (User)
 *    - Unique: [followerId, targetId] (one follow per user pair)
 *    - Indexes: [followerId], [targetId], [createdAt]
 * 
 * 2. Block:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User - the blocker)
 *    - blockedUserId (String, relation to User - the blocked)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), blockedUser (User)
 *    - Unique: [userId, blockedUserId] (one block per user pair)
 *    - Indexes: [userId], [blockedUserId]
 * 
 * 3. SocialActivity:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - type (String, enum: 'mission_completed' | 'level_up' | 'mount_upgraded' | 'item_crafted' | 'achievement_unlocked' | 'question_answered' | 'fight_won' | 'marketplace_sale')
 *    - refId (String?, nullable) - Reference to related entity (missionId, itemId, etc.)
 *    - metadata (Json?, nullable) - Additional data (itemName, level, etc.)
 *    - timestamp (DateTime, @default(now()))
 *    - Relations: user (User)
 *    - Indexes: [userId], [type], [timestamp] (desc for feed queries)
 * 
 * Enums (if using Prisma enum):
 *    enum ActivityType {
 *      mission_completed
 *      level_up
 *      mount_upgraded
 *      item_crafted
 *      achievement_unlocked
 *      question_answered
 *      fight_won
 *      marketplace_sale
 *    }
 * 
 * Note: The system currently uses string values, but enums are recommended for type safety.
 * 
 * Integration Points:
 * - Follow.followerId → User.id (follower)
 * - Follow.targetId → User.id (followed user)
 * - Block.userId → User.id (blocker)
 * - Block.blockedUserId → User.id (blocked user)
 * - SocialActivity.userId → User.id (activity owner)
 * 
 * Relationship Notes:
 * - Follow is one-way (follower → target), no mutual requirement
 * - Block prevents all interactions (feed, compare, follow)
 * - SocialActivity is used for feed generation (last 7-30 days typically)
 */

export const SCHEMA_VERSION = '0.36.42';
export const SCHEMA_MODULE = 'Social Systems 1.0';

