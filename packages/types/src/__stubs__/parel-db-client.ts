/**
 * Build-time stub for @parel/db/client so packages/types compiles without
 * pulling in packages/db source (avoids TS6059/TS6307).
 */

export interface User {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  ageGroup?: string | null;
  region?: string | null;
  interests?: string[] | null;
  tone?: string | null;
  onboardingCompleted?: boolean;
  xp?: number | null;
  level?: number | null;
  streakCount?: number | null;
  questionsAnswered?: number | null;
  createdAt?: Date;
  lastLoginAt?: Date | null;
}
