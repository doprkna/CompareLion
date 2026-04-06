/**
 * AURE Interaction Engine - Faction Battles Service
 * Manages archetype vs archetype battles
 * v0.39.2 - AURE Interaction Engine
 */
export interface FactionBattle {
    id: string;
    weekStart: Date;
    weekEnd: Date;
    archetypeA: string;
    archetypeB: string;
    scoreA: number;
    scoreB: number;
}
/**
 * Get current week's faction battle
 * Returns the active battle for this week
 */
export declare function getCurrentFactionBattle(): Promise<FactionBattle | null>;
/**
 * Record faction contribution
 * Adds points to archetypeA or archetypeB for current week
 */
export declare function recordFactionContribution(userId: string, archetypeId: string, amount?: number): Promise<{
    success: boolean;
}>;
/**
 * Get battle winner
 * Returns the archetype with higher score
 */
export declare function getBattleWinner(battle: FactionBattle): 'A' | 'B' | 'tie';
