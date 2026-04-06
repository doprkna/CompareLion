/**
 * Event Effect Resolver
 * Resolves and applies event effects to game systems
 * v0.36.41 - Events System 1.0
 */
import { ResolvedEventEffects } from './types';
/**
 * Resolve event effects for active events
 * Combines all active event effects into a single resolved set
 *
 * @param userId - Optional user ID for user-specific effects
 * @returns Resolved event effects
 */
export declare function resolveEventEffects(userId?: string): Promise<ResolvedEventEffects>;
/**
 * Apply XP multiplier to base XP
 */
export declare function applyXPMultiplier(baseXP: number, multiplier: number): number;
/**
 * Apply gold multiplier to base gold
 */
export declare function applyGoldMultiplier(baseGold: number, multiplier: number): number;
/**
 * Apply drop boost to base drop rate
 */
export declare function applyDropBoost(baseDropRate: number, boost: number): number;
/**
 * Apply damage buff/nerf to base damage
 */
export declare function applyDamageModifiers(baseDamage: number, buff: number, nerf: number): number;
/**
 * Apply challenge bonus to base score
 */
export declare function applyChallengeBonus(baseScore: number, bonus: number): number;
/**
 * Get active events with resolved effects
 * Convenience function for API responses
 */
export declare function getActiveEventsWithEffects(userId?: string): Promise<{
    events: any;
    resolvedEffects: ResolvedEventEffects;
}>;
