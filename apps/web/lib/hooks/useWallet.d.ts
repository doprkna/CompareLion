export interface UseWalletReturn {
    gold: number;
    diamonds: number;
    loading: boolean;
    refresh: () => Promise<void>;
}
export declare function useWallet(): UseWalletReturn;
