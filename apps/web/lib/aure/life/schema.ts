/**
 * AURE Life Engine Schema Definition
 * 
 * This file documents the Prisma schema structure for AURE Life Engine
 * 
 * v0.39.1 - AURE Life Engine (Timeline + Archetypes + Weekly Vibe)
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. TimelineEvent:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - type (String, enum: 'rating' | 'challenge' | 'vs' | 'quest' | 'assist')
 *    - referenceId (String?, nullable) - requestId, entryId, etc.
 *    - category (String?, nullable) - snack / outfit / room / etc.
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User)
 *    - Indexes: [userId], [type], [createdAt] (desc for latest queries)
 * 
 * 2. UserArchetype:
 *    - userId (String, @id, relation to User, unique)
 *    - archetypeId (String) - Must match catalog IDs (e.g. "cozy-gremlin", "minimalist-monk", "chaos-goblin")
 *    - confidence (Int) - 0-100
 *    - description (String?, nullable) - AI-generated 1-2 sentence explanation
 *    - previousArchetypeId (String?, nullable) - Last archetype before change
 *    - changeReason (String?, nullable) - Short text explaining why archetype changed
 *    - updatedAt (DateTime, @default(now()), @updatedAt)
 *    - Relations: user (User)
 *    - Indexes: [userId], [archetypeId]
 * 
 * 3. UserArchetypeHistory (Optional - only if approved):
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - archetypeId (String)
 *    - confidence (Int) - 0-100
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User)
 *    - Indexes: [userId], [createdAt] (desc for latest queries)
 * 
 * Enums (if using Prisma enum):
 *    enum TimelineEventType {
 *      rating
 *      challenge
 *      vs
 *      quest
 *      assist
 *    }
 * 
 * Integration Points:
 * - TimelineEvent.userId → User.id (event owner)
 * - UserArchetype.userId → User.id (archetype owner, one per user)
 * 
 * Notes:
 * - TimelineEvent records important AURE events (ratings, challenges, VS, etc.)
 * - UserArchetype is one-per-user (userId is primary key)
 * - Archetype detection uses AI to analyze last 30-60 TimelineEvents + RatingResults
 * - Weekly vibe summary uses last 7 days of TimelineEvents
 */

export const SCHEMA_VERSION = '0.39.1';
export const SCHEMA_MODULE = 'AURE Life Engine (Timeline + Archetypes + Weekly Vibe)';

