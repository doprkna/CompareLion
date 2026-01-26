/**
 * Events System Types & Enums
 * Shared types, enums, and interfaces for Events System 1.0
 * v0.36.41 - Events System 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Event Type
 */
export enum EventType {
  WILDCARD = 'wildcard', // Random global events
  SEASONAL = 'seasonal', // Time-bound seasonal events
}

/**
 * Event Effect Type
 */
export enum EventEffectType {
  XP_MULTIPLIER = 'xpMultiplier',
  GOLD_MULTIPLIER = 'goldMultiplier',
  DROP_BOOST = 'dropBoost',
  DAMAGE_BUFF = 'damageBuff',
  DAMAGE_NERF = 'damageNerf',
  CHALLENGE_BONUS = 'challengeBonus',
}

/**
 * Effect Target Scope
 */
export enum EffectTarget {
  GLOBAL = 'global', // Applies to all users
  USER = 'user', // Applies to specific user
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Event effect definition
 */
export interface EventEffect {
  id: string;
  eventId: string;
  effectType: EventEffectType;
  value: number; // Numeric modifier value
  target: EffectTarget;
  description?: string | null;
  // Relations (populated)
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
  // Relations (populated)
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
  // Relations (populated)
  event?: Event;
}

/**
 * Resolved event effects (for application)
 */
export interface ResolvedEventEffects {
  xpMultiplier: number; // e.g., 1.2 for +20%
  goldMultiplier: number;
  dropBoost: number; // Additional drop rate percentage
  damageBuff: number; // Damage multiplier (e.g., 1.15 for +15%)
  damageNerf: number; // Damage reduction multiplier (e.g., 0.9 for -10%)
  challengeBonus: number; // Additional challenge completion bonus
}

/**
 * Event with resolved effects (for API responses)
 */
export interface EventWithEffects extends Event {
  resolvedEffects: ResolvedEventEffects;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate event type
 */
export function isValidEventType(value: string): value is EventType {
  return Object.values(EventType).includes(value as EventType);
}

/**
 * Validate effect type
 */
export function isValidEffectType(value: string): value is EventEffectType {
  return Object.values(EventEffectType).includes(value as EventEffectType);
}

/**
 * Get event type display name
 */
export function getEventTypeDisplayName(type: EventType): string {
  const displayNames: Record<EventType, string> = {
    [EventType.WILDCARD]: 'Wildcard Event',
    [EventType.SEASONAL]: 'Seasonal Event',
  };
  return displayNames[type] || type;
}

/**
 * Get effect type display name
 */
export function getEffectTypeDisplayName(effectType: EventEffectType): string {
  const displayNames: Record<EventEffectType, string> = {
    [EventEffectType.XP_MULTIPLIER]: 'XP Multiplier',
    [EventEffectType.GOLD_MULTIPLIER]: 'Gold Multiplier',
    [EventEffectType.DROP_BOOST]: 'Drop Boost',
    [EventEffectType.DAMAGE_BUFF]: 'Damage Buff',
    [EventEffectType.DAMAGE_NERF]: 'Damage Nerf',
    [EventEffectType.CHALLENGE_BONUS]: 'Challenge Bonus',
  };
  return displayNames[effectType] || effectType;
}

/**
 * Check if event is currently active
 */
export function isEventActive(event: Event): boolean {
  if (!event.active) {
    return false;
  }
  
  const now = new Date();
  return event.startAt <= now && event.endAt >= now;
}

/**
 * Get time remaining for event
 */
export function getEventTimeRemaining(event: Event): { days: number; hours: number; minutes: number } | null {
  if (!isEventActive(event)) {
    return null;
  }
  
  const now = new Date();
  const diff = event.endAt.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

