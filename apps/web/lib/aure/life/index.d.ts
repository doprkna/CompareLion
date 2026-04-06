/**
 * AURE Life Engine - Public Exports
 * Helpers and hooks for other systems
 * v0.39.5 - Archetype Engine 2.0
 */
export { getUserArchetype, recalculateUserArchetype, getNearbyArchetypes } from './archetypeService';
export { getArchetypeById, getAllArchetypeIds, getFactionForArchetype, ARCHETYPE_CATALOG } from './archetypes';
export type { UserArchetype, NearbyArchetype } from './archetypeService';
export type { Archetype } from './archetypes';
export { recordTimelineEvent, getUserTimeline } from './timelineService';
export type { TimelineEvent, TimelineEventType } from './timelineService';
export { generateWeeklyVibe } from './weeklyVibeService';
export type { WeeklyVibe } from './weeklyVibeService';
