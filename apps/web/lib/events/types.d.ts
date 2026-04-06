/**
 * Events System Types & Enums
 * Shared types, enums, and interfaces for Events System 1.0
 * v0.36.41 - Events System 1.0
 */
/**
 * Event Type
 */
export declare enum EventType {
    WILDCARD = "wildcard",// Random global events
    SEASONAL = "seasonal"
}
/**
 * Event Effect Type
 */
export declare enum EventEffectType {
    XP_MULTIPLIER = "xpMultiplier",
    GOLD_MULTIPLIER = "goldMultiplier",
    DROP_BOOST = "dropBoost",
    DAMAGE_BUFF = "damageBuff",
    DAMAGE_NERF = "damageNerf",
    CHALLENGE_BONUS = "challengeBonus"
}
/**
 * Effect Target Scope
 */
export declare enum EffectTarget {
    GLOBAL = "global",// Applies to all users
    USER = "user"
}
/**
 * Event effect definition
 */
export interface EventEffect {
    id: string;
    eventId: string;
    effectType: EventEffectType;
    value: number;
    target: EffectTarget;
    description?: string | null;
    event?: Event;
}
/**
 * Event definition
 */
export interface Event {
    id: string;
    name: string;
    description?: string | null;
    type: EventType;
    startAt: Date;
    endAt: Date;
    active: boolean;
    icon?: string | null;
    emoji?: string | null;
    effects?: EventEffect[];
}
/**
 * Event log entry (user participation tracking)
 */
export interface EventLog {
    id: string;
    eventId: string;
    userId: string;
    timestamp: Date;
    event?: Event;
}
/**
 * Resolved event effects (for application)
 */
export interface ResolvedEventEffects {
    xpMultiplier: number;
    goldMultiplier: number;
    dropBoost: number;
    damageBuff: number;
    damageNerf: number;
    challengeBonus: number;
}
/**
 * Event with resolved effects (for API responses)
 */
export interface EventWithEffects extends Event {
    resolvedEffects: ResolvedEventEffects;
}
/**
 * Validate event type
 */
export declare function isValidEventType(value: string): value is EventType;
/**
 * Validate effect type
 */
export declare function isValidEffectType(value: string): value is EventEffectType;
/**
 * Get event type display name
 */
export declare function getEventTypeDisplayName(type: EventType): string;
/**
 * Get effect type display name
 */
export declare function getEffectTypeDisplayName(effectType: EventEffectType): string;
/**
 * Check if event is currently active
 */
export declare function isEventActive(event: Event): boolean;
/**
 * Get time remaining for event
 */
export declare function getEventTimeRemaining(event: Event): {
    days: number;
    hours: number;
    minutes: number;
} | null;
