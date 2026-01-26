/**
 * Event DTOs
 * Data transfer objects for community events
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */

/**
 * Base Event DTO
 * Minimal event shape for community events (challenges, themed weeks, spotlights)
 */
export interface EventDTO {
  /** Event ID */
  id: string;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Event type */
  type: 'CHALLENGE' | 'THEMED_WEEK' | 'SPOTLIGHT' | 'COMMUNITY';
  /** Event status */
  status: 'DRAFT' | 'ACTIVE' | 'UPCOMING' | 'ENDED' | 'CANCELLED';
  /** Start date (ISO 8601) */
  startDate: string;
  /** End date (ISO 8601) */
  endDate: string;
  /** XP reward (optional) */
  rewardXP?: number;
  /** Diamonds reward (optional) */
  rewardDiamonds?: number;
  /** Time remaining in milliseconds (computed, for active events) */
  timeRemaining?: number | null;
  /** Time until start in milliseconds (computed, for upcoming events) */
  timeUntilStart?: number | null;
}

