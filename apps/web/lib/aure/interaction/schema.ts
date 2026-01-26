/**
 * AURE Interaction Engine Schema Definition
 * 
 * This file documents the Prisma schema structure for AURE Interaction Engine
 * 
 * v0.39.2 - AURE Interaction Engine (Multi-Loop Interaction Core)
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. Quest:
 *    - id (String, @id, @default(cuid()))
 *    - type (String, enum: 'upload' | 'rate' | 'vs' | 'coach' | 'mix')
 *    - description (String)
 *    - rewardXp (Int, default 0)
 *    - isWeekly (Boolean, default false)
 *    - isDaily (Boolean, default false)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: progress (QuestProgress[])
 *    - Indexes: [type], [isDaily], [isWeekly]
 * 
 * 2. QuestProgress:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - questId (String, relation to Quest)
 *    - progress (Int, default 0)
 *    - required (Int, default 1)
 *    - completedAt (DateTime?, nullable)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), quest (Quest)
 *    - Unique: [userId, questId] (one progress per user per quest)
 *    - Indexes: [userId], [questId], [completedAt]
 * 
 * 3. FactionBattle:
 *    - id (String, @id, @default(cuid()))
 *    - weekStart (DateTime)
 *    - weekEnd (DateTime)
 *    - archetypeA (String) - e.g. "cozy-gremlin"
 *    - archetypeB (String) - e.g. "minimalist-monk"
 *    - scoreA (Int, default 0)
 *    - scoreB (Int, default 0)
 *    - createdAt (DateTime, @default(now()))
 *    - Indexes: [weekStart], [weekEnd], [archetypeA], [archetypeB]
 *    - Unique: [weekStart, archetypeA, archetypeB] (one battle per week per pair)
 * 
 * 4. MixSession:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - requestIds (Json) - Array of RatingRequest IDs
 *    - story (String?, nullable) - AI-generated story
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User)
 *    - Indexes: [userId], [createdAt]
 * 
 * 5. AiHumanBattle:
 *    - id (String, @id, @default(cuid()))
 *    - leftRequestId (String, relation to RatingRequest)
 *    - rightRequestId (String, relation to RatingRequest)
 *    - aiWinner (String, enum: 'left' | 'right')
 *    - humanVotesA (Int, default 0)
 *    - humanVotesB (Int, default 0)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: leftRequest (RatingRequest), rightRequest (RatingRequest)
 *    - Indexes: [leftRequestId], [rightRequestId], [createdAt]
 * 
 * 6. AiHumanVote:
 *    - id (String, @id, @default(cuid()))
 *    - battleId (String, relation to AiHumanBattle)
 *    - userId (String, relation to User)
 *    - choice (String, enum: 'left' | 'right')
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: battle (AiHumanBattle), user (User)
 *    - Unique: [battleId, userId] (one vote per user per battle)
 *    - Indexes: [battleId], [userId]
 * 
 * Enums (if using Prisma enum):
 *    enum QuestType {
 *      upload
 *      rate
 *      vs
 *      coach
 *      mix
 *    }
 *    enum BattleChoice {
 *      left
 *      right
 *    }
 * 
 * Integration Points:
 * - QuestProgress.userId → User.id (quest progress owner)
 * - QuestProgress.questId → Quest.id (quest reference)
 * - MixSession.userId → User.id (mix session owner)
 * - AiHumanBattle.leftRequestId → RatingRequest.id (left entry)
 * - AiHumanBattle.rightRequestId → RatingRequest.id (right entry)
 * - AiHumanVote.battleId → AiHumanBattle.id (vote target)
 * - AiHumanVote.userId → User.id (voter)
 * 
 * Notes:
 * - Quests use simple counters (no scheduling logic yet)
 * - Faction battles are weekly (one battle per archetype pair per week)
 * - Mix sessions combine multiple rating requests into AI-generated stories
 * - AI vs Human battles compare AI picks vs human votes
 */

export const SCHEMA_VERSION = '0.39.2';
export const SCHEMA_MODULE = 'AURE Interaction Engine (Multi-Loop Interaction Core)';

