/**
 * Challenge DTOs
 * Data transfer objects for challenges (daily/weekly)
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */

/**
 * Base Challenge DTO
 * Minimal challenge shape for daily/weekly challenges
 */
export interface ChallengeDTO {
  /** Challenge identifier */
  id: string;
  /** Challenge title */
  title: string;
  /** Challenge description */
  description: string;
  /** Challenge type */
  type: 'daily' | 'weekly';
  /** Target value to complete challenge */
  target: number;
  /** Metric being tracked (e.g., 'questions_answered', 'streak_maintained') */
  metric: string;
  /** Reward structure */
  reward: {
    /** XP reward */
    xp: number;
    /** Diamonds reward */
    diamonds: number;
  };
  /** Optional icon/emoji */
  icon?: string;
  /** User-specific progress (optional, added when user context available) */
  progress?: number;
  /** User-specific completion status (optional, added when user context available) */
  completed?: boolean;
}

