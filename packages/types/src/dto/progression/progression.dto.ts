/**
 * Progression DTOs
 * Data transfer objects for user progression, stats, and sessions
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */

import type { UserDTO } from '../user';

/**
 * User statistics DTO
 * Aggregated stats from user sessions and activity
 */
export interface UserStatsDTO {
  /** Total number of sessions */
  totalSessions: number;
  /** Total number of answers */
  totalAnswers: number;
  /** Total time spent (milliseconds) */
  totalTime: number;
  /** Answers in last session */
  lastSessionAnswers: number;
  /** Time spent in last session (milliseconds) */
  lastSessionTime: number;
}

/**
 * Session DTO
 * Flow session data
 */
export interface SessionDTO {
  /** Session ID */
  id: string;
  /** Session start time */
  startedAt: Date | string;
  /** Session completion time (null if not completed) */
  completedAt: Date | string | null;
  /** Number of answers in session */
  answers: number;
  /** Time spent in session (milliseconds) */
  timeSpent: number;
}

/**
 * Today's activity DTO
 * Today's answered and skipped counts
 */
export interface TodayActivityDTO {
  /** Questions answered today */
  answered: number;
  /** Questions skipped today */
  skipped: number;
}

/**
 * User profile with stats DTO
 * Extended user profile including progression and stats
 */
export interface UserProfileWithStatsDTO extends UserDTO {
  /** Streak count */
  streakCount?: number | null;
  /** Today's activity */
  today: TodayActivityDTO;
  /** User statistics */
  stats: UserStatsDTO;
  /** Session history */
  sessions: SessionDTO[];
}

