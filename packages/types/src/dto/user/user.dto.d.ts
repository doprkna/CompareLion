/**
 * User DTOs
 * Data transfer objects for user data
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */
/**
 * Base User DTO
 * Minimal user shape for API responses
 * Note: Extends UserProfile from @parel/types where possible
 */
export interface UserDTO {
    /** User ID */
    id: string;
    /** User email */
    email: string;
    /** Username (optional) */
    username?: string | null;
    /** Display name (optional) */
    name?: string | null;
    /** Avatar URL (optional) */
    avatarUrl?: string | null;
    /** User level */
    level?: number;
    /** User XP */
    xp?: number;
}
