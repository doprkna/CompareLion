/**
 * Missions & Quests Schema Definition
 * 
 * This file documents the Prisma schema changes needed for Missions & Quests 1.0
 * See SCHEMA_UPDATE.md for full migration SQL (if accessible)
 * 
 * v0.36.36 - Missions & Quests 1.0
 */

/**
 * Prisma Schema Changes Required:
 * 
 * 1. Add Enums:
 *    - MissionType: daily, weekly, quest
 *    - ObjectiveType: kill_enemies, answer_questions, collect_materials, earn_gold, win_fights, login, craft_items, trade_items, send_messages, complete_challenges, level_up, spend_gold, equip_items, use_consumables
 * 
 * 2. Add Mission Model:
 *    - id, type, objectiveType, targetValue, title, description
 *    - reward (JSON), isActive, isRepeatable, sortOrder
 *    - category?, icon?, questChainId?, questStep?, prerequisiteMissionId?
 *    - createdAt, updatedAt
 *    - Relations: progress[], prerequisiteMission?, dependentMissions[]
 *    - Indexes: [type, isActive], [objectiveType], [questChainId], [sortOrder]
 * 
 * 3. Add MissionProgress Model:
 *    - id, userId, missionId, currentValue, completed, claimed
 *    - assignedAt, completedAt?, claimedAt?
 *    - Relations: user, mission
 *    - Unique: [userId, missionId]
 *    - Indexes: [userId], [missionId], [userId, completed, claimed]
 * 
 * 4. Update User Model:
 *    - Add relation: missionProgress MissionProgress[]
 * 
 * See missionRegistry.ts for default mission templates to seed after migration.
 */

export const SCHEMA_VERSION = '0.36.36';
export const SCHEMA_MODULE = 'Missions & Quests 1.0';

