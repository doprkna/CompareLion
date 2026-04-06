/**
 * RPG Event Engine
 * Unified event system for global modifiers
 * v0.36.15 - Event System
 */
import { ComputedStats } from './stats';
export interface EventEffect {
    atkMultiplier?: number;
    defMultiplier?: number;
    hpMultiplier?: number;
    critBonus?: number;
    speedBonus?: number;
    xpBonus?: number;
    goldBonus?: number;
    enemyAtkMultiplier?: number;
    enemyHpMultiplier?: number;
}
export interface RpgEvent {
    id: string;
    code: string;
    name: string;
    description: string | null;
    effect: EventEffect;
    startsAt: Date;
    endsAt: Date;
    active: boolean;
}
/**
 * Get all active events at a given time
 * Returns empty array if no events or on error
 */
export declare function getActiveEvents(now?: Date): Promise<RpgEvent[]>;
/**
 * Apply event effects to hero stats
 * Multiplies multipliers, adds bonuses
 */
export declare function applyEventsToHero(baseStats: ComputedStats, events: RpgEvent[]): ComputedStats;
/**
 * Apply event effects to rewards
 * Multiplies XP and gold by (1 + bonus%)
 */
export declare function applyEventsToRewards(rewards: {
    xp: number;
    gold: number;
}, events: RpgEvent[]): {
    xp: number;
    gold: number;
};
/**
 * Apply event effects to enemy stats
 * Only applies if event has enemy modifiers
 */
export declare function applyEventsToEnemy(enemyStats: {
    hp: number;
    atk: number;
    def?: number;
}, events: RpgEvent[]): {
    hp: number;
    atk: number;
    def?: number;
};
