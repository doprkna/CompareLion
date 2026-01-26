/**
 * Achievement DTOs
 * Data transfer objects for achievements
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */
/**
 * Achievement DTO
 * Achievement shape with unlock status
 */
export interface AchievementDTO {
    /** Achievement ID */
    id: string;
    /** Achievement key/identifier */
    key: string;
    /** Achievement title */
    title: string;
    /** Achievement description (optional) */
    description?: string | null;
    /** Achievement icon (optional) */
    icon?: string | null;
    /** Achievement category (optional) */
    category?: string | null;
    /** XP reward (optional) */
    xpReward?: number | null;
    /** Gold reward (optional) */
    goldReward?: number | null;
    /** Whether achievement is unlocked (optional, user-specific) */
    isUnlocked?: boolean;
    /** When achievement was unlocked (optional, user-specific) */
    unlockedAt?: Date | string | null;
}
