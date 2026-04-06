/**
 * Skill Service
 * Skills & Abilities system management
 * v0.36.33 - Skills & Abilities v1
 */
export interface SkillData {
    name: string;
    type: 'active' | 'passive';
    description: string;
    power: number;
    cooldown?: number;
    icon?: string;
    scaling?: {
        perLevel?: number;
    };
}
/**
 * MVP Skill Set - Seed data
 */
export declare const MVP_SKILLS: SkillData[];
/**
 * Seed skills into database (idempotent)
 */
export declare function seedSkills(): Promise<void>;
/**
 * Get user's skills with full skill data
 */
export declare function getUserSkills(userId: string): Promise<any>;
/**
 * Get user's equipped active skill
 */
export declare function getEquippedActiveSkill(userId: string): Promise<any>;
/**
 * Get user's passive skills (all unlocked passives are active)
 */
export declare function getUserPassiveSkills(userId: string): Promise<any>;
/**
 * Unlock a skill for a user (idempotent - prevents duplicates)
 */
export declare function unlockSkill(userId: string, skillId: string): Promise<string>;
/**
 * Equip an active skill (unequips others automatically)
 */
export declare function equipActiveSkill(userId: string, userSkillId: string): Promise<void>;
/**
 * Unequip active skill
 */
export declare function unequipActiveSkill(userId: string, userSkillId: string): Promise<void>;
/**
 * Level up a skill
 */
export declare function levelUpSkill(userSkillId: string): Promise<{
    newLevel: number;
}>;
/**
 * Update skill cooldown (decrement or set)
 */
export declare function updateSkillCooldown(userSkillId: string, cooldownRemaining: number): Promise<void>;
/**
 * Use active skill (sets cooldown)
 */
export declare function useActiveSkill(userSkillId: string): Promise<void>;
/**
 * Decrement all skill cooldowns for user (called each combat round)
 */
export declare function decrementSkillCooldowns(userId: string): Promise<void>;
