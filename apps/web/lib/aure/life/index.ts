/**
 * AURE Life Engine - Public Exports
 * Helpers and hooks for other systems
 * v0.39.5 - Archetype Engine 2.0
 */

// Archetype helpers
export { getUserArchetype, recalculateUserArchetype, getNearbyArchetypes } from './archetypeService';
export { getArchetypeById, getAllArchetypeIds, getFactionForArchetype, ARCHETYPE_CATALOG } from './archetypes';
export type { UserArchetype, NearbyArchetype } from './archetypeService';
export type { Archetype } from './archetypes';

// Timeline helpers
export { recordTimelineEvent, getUserTimeline } from './timelineService';
export type { TimelineEvent, TimelineEventType } from './timelineService';

// Weekly vibe helpers
export { generateWeeklyVibe } from './weeklyVibeService';
export type { WeeklyVibe } from './weeklyVibeService';

