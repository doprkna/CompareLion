export declare function useClaimBadge(): {
    claimBadge: (userBadgeId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
