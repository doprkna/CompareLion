/**
 * Missions & Quests Types & Enums
 * Shared types, enums, and interfaces for Missions & Quests system
 * v0.36.36 - Missions & Quests 1.0
 */
/**
 * Mission Type - Determines reset schedule and assignment
 */
export declare enum MissionType {
    DAILY = "daily",
    WEEKLY = "weekly",
    QUEST = "quest"
}
/**
 * Objective Type - What the mission tracks
 */
export declare enum ObjectiveType {
    KILL_ENEMIES = "kill_enemies",
    ANSWER_QUESTIONS = "answer_questions",
    COLLECT_MATERIALS = "collect_materials",
    EARN_GOLD = "earn_gold",
    WIN_FIGHTS = "win_fights",
    LOGIN = "login",
    CRAFT_ITEMS = "craft_items",
    TRADE_ITEMS = "trade_items",
    SEND_MESSAGES = "send_messages",
    COMPLETE_CHALLENGES = "complete_challenges",
    LEVEL_UP = "level_up",
    SPEND_GOLD = "spend_gold",
    EQUIP_ITEMS = "equip_items",
    USE_CONSUMABLES = "use_consumables"
}
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
    category?: string;
    icon?: string;
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
/**
 * Validate mission type
 */
export declare function isValidMissionType(value: string): value is MissionType;
/**
 * Validate objective type
 */
export declare function isValidObjectiveType(value: string): value is ObjectiveType;
/**
 * Get objective type display name
 */
export declare function getObjectiveTypeDisplayName(type: ObjectiveType): string;
/**
 * Get mission type display name
 */
export declare function getMissionTypeDisplayName(type: MissionType): string;
/**
 * Calculate progress percentage
 */
export declare function calculateProgressPercent(currentValue: number, targetValue: number): number;
