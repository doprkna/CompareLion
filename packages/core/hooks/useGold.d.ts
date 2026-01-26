/**
 * useGold Hook
 * Manages user gold balance with real-time updates
 * v0.26.2 - Economy Feedback & Shop Loop
 */
export interface UseGoldReturn {
    gold: number;
    loading: boolean;
    refreshGold: () => Promise<void>;
}
export declare function useGold(): UseGoldReturn;
