/**
 * Events System Schema Definition
 * 
 * This file documents the Prisma schema structure for Events System 1.0
 * Note: Models may already exist (rpgEvent, etc.)
 * 
 * v0.36.41 - Events System 1.0
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. Event:
 *    - id (String, @id, @default(cuid()))
 *    - name (String)
 *    - description (String?, nullable)
 *    - type (String, enum: 'wildcard' | 'seasonal')
 *    - startAt (DateTime)
 *    - endAt (DateTime)
 *    - active (Boolean, default false)
 *    - icon (String?, nullable)
 *    - emoji (String?, nullable)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: effects (EventEffect[]), logs (EventLog[])
 *    - Indexes: [active, startAt, endAt], [type]
 * 
 * 2. EventEffect:
 *    - id (String, @id, @default(cuid()))
 *    - eventId (String, relation to Event)
 *    - effectType (String, enum: 'xpMultiplier' | 'goldMultiplier' | 'dropBoost' | 'damageBuff' | 'damageNerf' | 'challengeBonus')
 *    - value (Float) - Numeric modifier value
 *    - target (String, enum: 'global' | 'user', default 'global')
 *    - description (String?, nullable)
 *    - Relations: event (Event)
 *    - Indexes: [eventId], [effectType]
 * 
 * 3. EventLog:
 *    - id (String, @id, @default(cuid()))
 *    - eventId (String, relation to Event)
 *    - userId (String, relation to User)
 *    - timestamp (DateTime, @default(now()))
 *    - Relations: event (Event), user (User)
 *    - Indexes: [eventId], [userId], [timestamp]
 *    - Unique: [eventId, userId, timestamp] (optional, if tracking unique participations)
 * 
 * Enums (if using Prisma enum):
 *    enum EventType {
 *      wildcard
 *      seasonal
 *    }
 * 
 *    enum EventEffectType {
 *      xpMultiplier
 *      goldMultiplier
 *      dropBoost
 *      damageBuff
 *      damageNerf
 *      challengeBonus
 *    }
 * 
 *    enum EffectTarget {
 *      global
 *      user
 *    }
 * 
 * Note: The system currently uses string values, but enums are recommended for type safety.
 * 
 * Integration Points:
 * - EventEffect.eventId → Event.id (for event effects)
 * - EventLog.eventId → Event.id (for participation tracking)
 * - EventLog.userId → User.id (for user participation)
 * 
 * Effect Value Interpretation:
 * - xpMultiplier: 1.2 = +20% XP
 * - goldMultiplier: 1.15 = +15% gold
 * - dropBoost: 0.1 = +10% drop rate
 * - damageBuff: 1.2 = +20% damage
 * - damageNerf: 0.9 = -10% damage (reduction)
 * - challengeBonus: 50 = +50 bonus points
 */

export const SCHEMA_VERSION = '0.36.41';
export const SCHEMA_MODULE = 'Events System 1.0';

