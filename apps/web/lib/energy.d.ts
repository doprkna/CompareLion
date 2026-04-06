/**
 * Energy Management System
 *
 * Manages user hearts (energy) with regeneration mechanic.
 * Max 5 hearts, regenerates 1 per hour.
 */
export interface EnergyStatus {
    hearts: number;
    maxHearts: number;
    nextRegenAt: Date | null;
    minutesUntilRegen: number;
}
/**
 * Get or create user energy status
 */
export declare function getUserEnergy(userId: string): Promise<EnergyStatus>;
/**
 * Consume hearts (e.g., for answering questions)
 */
export declare function consumeHearts(userId: string, amount?: number): Promise<boolean>;
/**
 * Add hearts (e.g., from completing quiz or eating food)
 */
export declare function addHearts(userId: string, amount?: number): Promise<void>;
/**
 * Check if user has enough hearts
 */
export declare function hasEnoughHearts(userId: string, required?: number): Promise<boolean>;
/**
 * Reset hearts to max (admin function or purchase)
 */
export declare function refillHearts(userId: string): Promise<void>;
/**
 * Format time until regeneration
 */
export declare function formatRegenTime(minutes: number): string;
