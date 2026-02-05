export declare function useShareCard(shareCardId?: string): {
    shareCard: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
