/**
 * Photo Challenge Schema Definition
 * 
 * This file documents the Prisma schema structure for Photo Challenge Module
 * 
 * v0.37.12 - Photo Challenge (Core + AI Stub)
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. PhotoChallengeEntry:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - imageUrl (String) - Path to uploaded image
 *    - category (String) - e.g. "healthy", "weird", "creative", "speedrun"
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), votes (PhotoVote[]), aiComment (AIComment?)
 *    - Indexes: [userId], [category], [createdAt] (desc for latest queries)
 * 
 * 2. PhotoVote:
 *    - id (String, @id, @default(cuid()))
 *    - entryId (String, relation to PhotoChallengeEntry)
 *    - userId (String, relation to User)
 *    - voteType (String, enum: 'appeal' | 'creativity')
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: entry (PhotoChallengeEntry), user (User)
 *    - Unique: [entryId, userId, voteType] (one vote per type per user per entry)
 *    - Indexes: [entryId], [userId], [entryId, voteType]
 * 
 * 3. AIComment (optional - can be simple table or on-demand):
 *    - id (String, @id, @default(cuid()))
 *    - entryId (String, relation to PhotoChallengeEntry)
 *    - text (String) - AI-generated comment
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: entry (PhotoChallengeEntry)
 *    - Unique: [entryId] (one comment per entry, optional)
 *    - Indexes: [entryId]
 * 
 * 4. ScamFlag (v0.38.6 - Image Integrity Check):
 *    - id (String, @id, @default(cuid()))
 *    - entryId (String, relation to PhotoChallengeEntry)
 *    - userId (String, relation to User)
 *    - reason (String, enum: 'watermark' | 'stock' | 'ai' | 'meme' | 'other')
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: entry (PhotoChallengeEntry), user (User)
 *    - Unique: [entryId, userId] (one flag per user per entry)
 *    - Indexes: [entryId], [userId]
 * 
 * Enums (if using Prisma enum):
 *    enum VoteType {
 *      appeal
 *      creativity
 *    }
 *    enum ScamFlagReason {
 *      watermark
 *      stock
 *      ai
 *      meme
 *      other
 *    }
 * 
 * Integration Points:
 * - PhotoChallengeEntry.userId → User.id (entry author)
 * - PhotoVote.entryId → PhotoChallengeEntry.id (voted entry)
 * - PhotoVote.userId → User.id (voter)
 * - AIComment.entryId → PhotoChallengeEntry.id (commented entry)
 * - ScamFlag.entryId → PhotoChallengeEntry.id (flagged entry)
 * - ScamFlag.userId → User.id (flagging user)
 * 
 * Notes:
 * - Unique constraint on PhotoVote ensures one vote per type per user per entry
 * - Unique constraint on ScamFlag ensures one flag per user per entry (soft signal, no blocking)
 * - Score computed via aggregation (COUNT of votes), not stored
 * - Images stored in /public/uploads/photo-challenge/ directory
 * - Maximum image size: 1 MB
 * - AIComment can be generated on-demand or cached (stub for now)
 * - ScamFlag is soft moderation signal (no blocking, no ranking penalties yet)
 */

export const SCHEMA_VERSION = '0.37.12';
export const SCHEMA_MODULE = 'Photo Challenge (Core + AI Stub)';

