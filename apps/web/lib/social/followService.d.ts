/**
 * Follow Service
 * Follow/unfollow user functionality
 * v0.36.42 - Social Systems 1.0
 */
/**
 * Follow a user
 * Creates a one-way follow relationship
 *
 * @param followerId - User ID of the follower
 * @param targetId - User ID to follow
 * @returns Success result
 */
export declare function followUser(followerId: string, targetId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Unfollow a user
 * Removes follow relationship
 *
 * @param followerId - User ID of the follower
 * @param targetId - User ID to unfollow
 * @returns Success result
 */
export declare function unfollowUser(followerId: string, targetId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Check if user is following another user
 */
export declare function isFollowing(followerId: string, targetId: string): Promise<boolean>;
/**
 * Get users that a user is following
 */
export declare function getFollowing(userId: string): Promise<string[]>;
/**
 * Get users that follow a user (followers)
 */
export declare function getFollowers(userId: string): Promise<string[]>;
