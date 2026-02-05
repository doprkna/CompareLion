/**
 * useAchievements Hook
 * Fetches achievements with unlock status, provides unlock function
 * v0.26.0 - Achievements Awakened
 * v0.41.13 - Migrated GET call to unified API client
 */
export interface Achievement {
    id: string;
    key: string | null;
    code: string;
    category: string;
    tier: number;
    title: string;
    name: string | null;
    description: string;
    emoji: string | null;
    icon: string | null;
    xpReward: number;
    rewardXp: number | null;
    rewardGold: number;
    unlocked: boolean;
    unlockedTier: number | null;
    unlockedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface UseAchievementsReturn {
    achievements: Achievement[];
    categories: Record<string, Achievement[]>;
    loading: boolean;
    error: string | null;
    unlockAchievement: (key: string, tier?: number) => Promise<boolean>;
    refetch: () => Promise<void>;
}
export declare function useAchievements(): UseAchievementsReturn;
