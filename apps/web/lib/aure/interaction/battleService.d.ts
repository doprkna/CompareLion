/**
 * AURE Interaction Engine - Faction Battle Service 2.0
 * Weekly archetype wars based on member activity
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */
export interface FactionBattle {
    id: string;
    weekStart: Date;
    weekEnd: Date;
    archetypeIds: string[];
    scores: Record<string, number>;
    winnerArchetypeId: string | null;
    createdAt: Date;
}
export interface FactionContribution {
    id: string;
    userId: string;
    archetypeId: string;
    battleId: string;
    amount: number;
    source: 'upload' | 'rate' | 'quest' | 'vs' | 'other';
    createdAt: Date;
}
/**
 * Get or create current battle
 */
export declare function getCurrentBattle(): Promise<FactionBattle | null>;
/**
 * Record faction contribution
 */
export declare function recordFactionContribution(userId: string, source: 'upload' | 'rate' | 'quest' | 'vs' | 'other', amount?: number): Promise<{
    success: boolean;
    battleId?: string;
}>;
/**
 * Resolve battle and determine winner
 */
export declare function resolveBattle(battleId: string): Promise<{
    success: boolean;
    winnerArchetypeId: string | null;
    scores: Record<string, number>;
}>;
/**
 * Get user's contribution for current battle
 */
export declare function getUserContribution(userId: string): Promise<{
    archetypeId: string | null;
    totalContribution: number;
    breakdown: Record<string, number>;
}>;
