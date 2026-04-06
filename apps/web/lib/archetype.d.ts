/**
 * Archetype Evolution System
 *
 * Determines user archetype based on stat distribution.
 * Passive bonuses for specialized builds.
 */
export interface Archetype {
    id: string;
    name: string;
    emoji: string;
    description: string;
    primaryStat: string;
    condition: string;
    xpBonus: number;
    bonusActions: string[];
}
export declare const ARCHETYPES: Archetype[];
export interface UserStats {
    sleep: number;
    health: number;
    social: number;
    knowledge: number;
    creativity: number;
}
/**
 * Detect archetype based on stat distribution
 */
export declare function detectArchetype(stats: UserStats): Archetype;
/**
 * Check if user's archetype has changed and evolve if needed
 */
export declare function checkAndEvolveArchetype(userId: string): Promise<{
    evolved: boolean;
    previousArchetype?: string;
    newArchetype?: Archetype;
    xpBonus?: number;
}>;
/**
 * Get archetype by name
 */
export declare function getArchetypeByName(name: string): Archetype | undefined;
/**
 * Calculate XP bonus for action based on archetype
 */
export declare function calculateArchetypeBonus(archetype: string, action: string, baseXp: number): number;
/**
 * Get user's archetype evolution history
 */
export declare function getArchetypeHistory(userId: string, limit?: number): Promise<any>;
