/**
 * AURE Life Engine - Archetype Service 2.0
 * Identity system for user archetypes with catalog-based assignment
 * v0.39.5 - Archetype Engine 2.0
 */
export interface UserArchetype {
    userId: string;
    archetypeId: string;
    confidence: number;
    description: string | null;
    updatedAt: Date;
    previousArchetypeId?: string | null;
    changeReason?: string | null;
}
export interface NearbyArchetype {
    archetypeId: string;
    label: string;
    emoji: string;
    similarity: number;
}
/**
 * Recalculate user archetype based on activity
 * Uses catalog-based assignment with AI refinement
 */
export declare function recalculateUserArchetype(userId: string): Promise<UserArchetype>;
/**
 * Get user archetype (or detect if missing)
 */
export declare function getUserArchetype(userId: string): Promise<UserArchetype | null>;
/**
 * Get nearby archetypes (similar archetypes that could fit)
 */
export declare function getNearbyArchetypes(userId: string): Promise<NearbyArchetype[]>;
export declare function detectUserArchetype(userId: string): Promise<UserArchetype>;
