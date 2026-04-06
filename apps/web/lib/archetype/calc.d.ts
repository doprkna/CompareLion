/**
 * Archetype Auto-Classification
 * Calculates user archetype based on playstyle and stats
 * v0.36.24 - Social Profiles 2.0
 */
export type ArchetypeType = 'Strategist' | 'Explorer' | 'Collector' | 'Socializer' | 'Challenger' | 'Sage' | 'Trickster' | 'Balanced';
/**
 * Calculate and update user archetype
 */
export declare function calculateUserArchetype(userId: string): Promise<ArchetypeType>;
/**
 * Get archetype for user (calculate if not set)
 */
export declare function getUserArchetype(userId: string): Promise<ArchetypeType>;
