/**
 * World Chronicle Schema Definition
 * 
 * This file documents the Prisma schema structure for World Chronicle 2.0
 * 
 * v0.36.43 - World Chronicle 2.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. ChronicleEntry:
 *    - id (String, @id, @default(cuid()))
 *    - seasonId (String?, nullable, relation to Season)
 *    - weekNumber (Int) - Week number within the year
 *    - summaryJSON (Json) - ChronicleStatsSnapshot structure
 *    - aiStory (String?, nullable) - AI-generated story paragraph
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: season (Season?)
 *    - Indexes: [seasonId], [weekNumber], [createdAt] (desc for latest queries)
 *    - Unique: [seasonId, weekNumber] (one chronicle per season/week)
 * 
 * Note: summaryJSON contains:
 *    {
 *      xpLeaders: Array<{ userId, username, name, xp, level }>,
 *      funniestAnswers: Array<{ userId, username, questionId, answerText, upvotes, timestamp }>,
 *      rareDrops: Array<{ userId, username, itemId, itemName, rarity, timestamp }>,
 *      events: Array<{ eventId, eventName, description, startAt, endAt, participantCount }>,
 *      globalStats?: {
 *        totalXP: number,
 *        totalGold: number,
 *        totalMissionsCompleted: number,
 *        totalFightsWon: number,
 *        activeUsers: number
 *      }
 *    }
 * 
 * Integration Points:
 * - ChronicleEntry.seasonId → Season.id (optional, for seasonal chronicles)
 * 
 * Performance Notes:
 * - Chronicle generation should use simple queries (no heavy joins)
 * - summaryJSON is stored as JSON for flexibility
 * - Indexes on seasonId and weekNumber for fast lookups
 * - createdAt index for latest chronicle queries
 */

export const SCHEMA_VERSION = '0.36.43';
export const SCHEMA_MODULE = 'World Chronicle 2.0';

