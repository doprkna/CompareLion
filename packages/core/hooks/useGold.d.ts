export interface UseGoldReturn {
    gold: number;
    loading: boolean;
    refreshGold: () => Promise<void>;
}
export declare function useGold(): UseGoldReturn;
