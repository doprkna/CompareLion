/**
 * Photo Challenge Scoring Configuration
 * AURE integration weights and normalization settings
 * v0.38.11 - Challenge Integration with AURE
 */
/**
 * Scoring weights for final score calculation
 * finalScore = humanScoreNorm * humanVotesWeight + aiScoreNorm * aiScoreWeight
 */
export declare const SCORING_WEIGHTS: {
    readonly humanVotesWeight: 0.6;
    readonly aiScoreWeight: 0.4;
};
/**
 * Normalization settings
 */
export declare const NORMALIZATION: {
    readonly maxHumanVotes: 100;
    readonly aiScoreMax: 100;
};
