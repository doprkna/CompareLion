/**
 * Seasons & Battlepass Schema Definition
 * 
 * This file documents the Prisma schema structure for Seasons & Battlepass 1.0
 * Note: Models may already exist (battlePassSeason, userBattlePass, season, seasonTier, userSeasonProgress)
 * 
 * v0.36.38 - Seasons & Battlepass 1.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. BattlePassSeason (or Season):
 *    - id, name, seasonNumber, startsAt, endsAt, isActive
 *    - premiumPrice (nullable)
 *    - tiers (JSON array of BattlepassTier)
 *    - description?, theme?
 * 
 * 2. UserBattlePass (or UserSeasonProgress):
 *    - id, userId, seasonId
 *    - xp (Int, default 0)
 *    - currentLevel/currentTier (Int, default 0)
 *    - premiumActive (Boolean, default false)
 *    - claimedRewards/claimedTiers (JSON array of numbers)
 *    - Unique: [userId, seasonId]
 * 
 * 3. BattlepassTier (or SeasonTier):
 *    - id, seasonId, level/tier (Int)
 *    - xpRequired (Int)
 *    - freeReward (JSON or relation)
 *    - premiumReward (JSON or relation)
 * 
 * The system supports both:
 * - Newer: battlePassSeason + userBattlePass
 * - Older: season + seasonTier + userSeasonProgress
 * 
 * Both are handled by the engine for backward compatibility.
 */

export const SCHEMA_VERSION = '0.36.38';
export const SCHEMA_MODULE = 'Seasons & Battlepass 1.0';

