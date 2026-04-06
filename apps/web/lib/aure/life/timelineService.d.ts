/**
 * AURE Life Engine - Timeline Service
 * Records and retrieves timeline events for users
 * v0.39.1 - AURE Life Engine
 */
export type TimelineEventType = 'rating' | 'challenge' | 'vs' | 'quest' | 'assist';
export interface TimelineEventData {
    userId: string;
    type: TimelineEventType;
    referenceId?: string | null;
    category?: string | null;
}
export interface TimelineEvent {
    id: string;
    userId: string;
    type: TimelineEventType;
    referenceId: string | null;
    category: string | null;
    createdAt: Date;
}
/**
 * Record a timeline event
 * Called when AURE events occur (rating completed, VS ended, challenge submitted, etc.)
 */
export declare function recordTimelineEvent(data: TimelineEventData): Promise<TimelineEvent>;
/**
 * Get timeline events for a user
 */
export declare function getUserTimeline(userId: string, limit?: number): Promise<TimelineEvent[]>;
/**
 * Get timeline events for archetype detection (last 30-60 events)
 */
export declare function getTimelineForArchetype(userId: string, limit?: number): Promise<TimelineEvent[]>;
/**
 * Get timeline events for weekly vibe (last 7 days)
 */
export declare function getTimelineForWeeklyVibe(userId: string): Promise<TimelineEvent[]>;
