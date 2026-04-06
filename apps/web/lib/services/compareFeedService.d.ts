/**
 * Compare Feed Service
 * Ranking and feed algorithms for Social Compare Feed 2.0
 * v0.36.31
 */
/**
 * Calculate feed score for ranking
 * Formula: (reactions * 3) + (comments * 2) + ageDecay + clusteringBoost
 */
export declare function calculateFeedScore(reactionCount: number, commentCount: number, createdAt: Date, value?: any, allValues?: any[]): number;
/**
 * Get trending compare posts (last 24 hours, highest score)
 */
export declare function getTrendingComparePosts(limit?: number): Promise<any>;
/**
 * Get compare post with full details (for single post view)
 */
export declare function getComparePostById(postId: string, userId?: string): Promise<any>;
/**
 * Get "People like you" feed (posts with similar values)
 * MVP: Simple implementation - can be enhanced later
 */
export declare function getSimilarComparePosts(userId: string, limit?: number): Promise<any>;
/**
 * Get global compare posts (all public posts, ranked by score)
 */
export declare function getGlobalComparePosts(limit?: number, cursor?: string): Promise<any>;
