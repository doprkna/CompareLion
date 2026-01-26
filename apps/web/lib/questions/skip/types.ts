/**
 * Skip Question Types
 * Shared types and interfaces for Skip Question Feature
 * v0.37.2 - Skip Question Feature
 */

/**
 * SkipQuestion interface
 */
export interface SkipQuestion {
  id: string;
  userId: string;
  questionId: string;
  skippedAt: Date;
}

/**
 * Skip result
 */
export interface SkipResult {
  success: boolean;
  error?: string;
}

