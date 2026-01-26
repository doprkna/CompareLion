/**
 * Photo Challenge Scoring Configuration
 * AURE integration weights and normalization settings
 * v0.38.11 - Challenge Integration with AURE
 */

/**
 * Scoring weights for final score calculation
 * finalScore = humanScoreNorm * humanVotesWeight + aiScoreNorm * aiScoreWeight
 */
export const SCORING_WEIGHTS = {
  humanVotesWeight: 0.6,  // 60% weight for community votes
  aiScoreWeight: 0.4,     // 40% weight for AI metrics
} as const;

/**
 * Normalization settings
 */
export const NORMALIZATION = {
  // Maximum expected human votes for normalization (appeal + creativity)
  maxHumanVotes: 100,
  
  // AI metrics are already 0-100, so no normalization needed
  aiScoreMax: 100,
} as const;

