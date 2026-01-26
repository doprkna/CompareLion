/**
 * Season Store
 * Zustand store for season data with user progress (multi-source aggregation)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
export interface Season {
    id: string;
    name: string;
    displayName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    [key: string]: any;
}
export interface UserProgress {
    level: number;
    xp: number;
    xpToNextLevel: number;
    completedChallenges: number;
    totalChallenges: number;
    [key: string]: any;
}
export declare const useSeasonStore: UseBoundStore<StoreApi<import("..").AsyncStore<T>>>;
