/**
 * Missions & Quests Types & Enums
 * Shared types, enums, and interfaces for Missions & Quests system
 * v0.36.36 - Missions & Quests 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Mission Type - Determines reset schedule and assignment
 */
export enum MissionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  QUEST = 'quest', // Long-form quest chains
}

/**
 * Objective Type - What the mission tracks
 */
export enum ObjectiveType {
  KILL_ENEMIES = 'kill_enemies',
  ANSWER_QUESTIONS = 'answer_questions',
  COLLECT_MATERIALS = 'collect_materials',
  EARN_GOLD = 'earn_gold',
  WIN_FIGHTS = 'win_fights',
  LOGIN = 'login',
  CRAFT_ITEMS = 'craft_items',
  TRADE_ITEMS = 'trade_items',
  SEND_MESSAGES = 'send_messages',
  COMPLETE_CHALLENGES = 'complete_challenges',
  LEVEL_UP = 'level_up',
  SPEND_GOLD = 'spend_gold',
  EQUIP_ITEMS = 'equip_items',
  USE_CONSUMABLES = 'use_consumables',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Mission reward structure
 */
export interface MissionReward {
  xp?: number;
  gold?: number;
  diamonds?: number;
  battlepassXP?: number;
  items?: Array<{
    itemId: string;
    quantity: number;
  }>;
  // Future: badges, titles, etc.
}

/**
 * Mission definition (template)
 */
export interface Mission {
  id: string;
  type: MissionType;
  objectiveType: ObjectiveType;
  targetValue: number;
  title: string;
  description: string;
  reward: MissionReward;
  isActive: boolean;
  isRepeatable: boolean;
  sortOrder: number;
  // Optional: metadata for filtering/grouping
  category?: string;
  icon?: string;
  // For quest chains
  questChainId?: string | null;
  questStep?: number | null;
  prerequisiteMissionId?: string | null;
}

/**
 * Mission progress (user-specific)
 */
export interface MissionProgress {
  id: string;
  userId: string;
  missionId: string;
  currentValue: number;
  completed: boolean;
  claimed: boolean;
  assignedAt: Date;
  completedAt?: Date | null;
  claimedAt?: Date | null;
}

/**
 * Mission with progress (for API responses)
 */
export interface MissionWithProgress extends Mission {
  progress: MissionProgress | null;
  progressPercent: number;
  canClaim: boolean;
}

/**
 * Quest chain definition (multi-step quests)
 */
export interface QuestChain {
  id: string;
  title: string;
  description: string;
  steps: Array<{
    missionId: string;
    stepNumber: number;
    title: string;
    description: string;
  }>;
  isActive: boolean;
  unlockLevel?: number | null;
  prerequisiteChainId?: string | null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate mission type
 */
export function isValidMissionType(value: string): value is MissionType {
  return Object.values(MissionType).includes(value as MissionType);
}

/**
 * Validate objective type
 */
export function isValidObjectiveType(value: string): value is ObjectiveType {
  return Object.values(ObjectiveType).includes(value as ObjectiveType);
}

/**
 * Get objective type display name
 */
export function getObjectiveTypeDisplayName(type: ObjectiveType): string {
  const displayNames: Record<ObjectiveType, string> = {
    [ObjectiveType.KILL_ENEMIES]: 'Kill Enemies',
    [ObjectiveType.ANSWER_QUESTIONS]: 'Answer Questions',
    [ObjectiveType.COLLECT_MATERIALS]: 'Collect Materials',
    [ObjectiveType.EARN_GOLD]: 'Earn Gold',
    [ObjectiveType.WIN_FIGHTS]: 'Win Fights',
    [ObjectiveType.LOGIN]: 'Login',
    [ObjectiveType.CRAFT_ITEMS]: 'Craft Items',
    [ObjectiveType.TRADE_ITEMS]: 'Trade Items',
    [ObjectiveType.SEND_MESSAGES]: 'Send Messages',
    [ObjectiveType.COMPLETE_CHALLENGES]: 'Complete Challenges',
    [ObjectiveType.LEVEL_UP]: 'Level Up',
    [ObjectiveType.SPEND_GOLD]: 'Spend Gold',
    [ObjectiveType.EQUIP_ITEMS]: 'Equip Items',
    [ObjectiveType.USE_CONSUMABLES]: 'Use Consumables',
  };
  return displayNames[type] || type;
}

/**
 * Get mission type display name
 */
export function getMissionTypeDisplayName(type: MissionType): string {
  const displayNames: Record<MissionType, string> = {
    [MissionType.DAILY]: 'Daily',
    [MissionType.WEEKLY]: 'Weekly',
    [MissionType.QUEST]: 'Quest',
  };
  return displayNames[type] || type;
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercent(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) return 0;
  return Math.min(100, Math.floor((currentValue / targetValue) * 100));
}

