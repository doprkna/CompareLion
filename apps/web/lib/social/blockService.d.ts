/**
 * Block Service
 * Block/mute user functionality and validation
 * v0.36.42 - Social Systems 1.0
 */
/**
 * Block a user
 * Prevents all interactions (feed, compare, follow)
 *
 * @param userId - User ID blocking
 * @param blockedUserId - User ID to block
 * @returns Success result
 */
export declare function blockUser(userId: string, blockedUserId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Unblock a user
 * Removes block relationship
 *
 * @param userId - User ID unblocking
 * @param blockedUserId - User ID to unblock
 * @returns Success result
 */
export declare function unblockUser(userId: string, blockedUserId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Check if user is blocked
 * Returns true if either user has blocked the other
 */
export declare function isUserBlocked(userId: string, targetUserId: string): Promise<boolean>;
/**
 * Get blocked user IDs for a user
 */
export declare function getBlockedUsers(userId: string): Promise<string[]>;
/**
 * Validate that users can interact
 * Checks if either user has blocked the other
 *
 * @param userA - First user ID
 * @param userB - Second user ID
 * @returns Validation result
 */
export declare function validateInteraction(userA: string, userB: string): Promise<{
    canInteract: boolean;
    reason?: string;
}>;
/**
 * Filter out blocked users from a list
 * Removes any users that are blocked by or blocking the current user
 *
 * @param userId - Current user ID
 * @param userIds - List of user IDs to filter
 * @returns Filtered list of user IDs
 */
export declare function filterBlockedUsers(userId: string, userIds: string[]): Promise<string[]>;
