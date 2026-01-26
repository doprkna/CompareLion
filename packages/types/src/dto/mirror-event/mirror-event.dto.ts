/**
 * Mirror Event DTOs
 * Data transfer objects for mirror events
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */

/**
 * Mirror event DTO
 * Mirror event structure with questions and mood
 */
export interface MirrorEventDTO {
  /** Event ID */
  id: string;
  /** Event key */
  key: string;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Event theme */
  theme: string;
  /** Start date */
  startDate: Date | string;
  /** End date */
  endDate: Date | string;
  /** Question set */
  questionSet: string[];
  /** XP reward */
  rewardXP: number;
  /** Badge ID reward (optional) */
  rewardBadgeId?: string | null;
  /** Time remaining in milliseconds */
  timeRemaining: number;
  /** Days remaining */
  daysRemaining: number;
  /** Global mood */
  globalMood: string;
}

/**
 * Mirror event response DTO
 * Mirror event endpoint response
 */
export interface MirrorEventResponseDTO {
  /** Mirror event (null if no active event) */
  event: MirrorEventDTO | null;
  /** Message (if no active event) */
  message?: string;
}

