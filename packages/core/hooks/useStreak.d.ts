/**
 * useStreak Hook
 * React hook for managing streaks in components
 * v0.13.2m - Retention Features
 * v0.41.20 - Migrated to unified state store
 */
import type { StreakData } from './streak';
export type { StreakData };
export declare function useStreak(): {
    streak: any;
    loading: any;
    recordActivity: any;
};
