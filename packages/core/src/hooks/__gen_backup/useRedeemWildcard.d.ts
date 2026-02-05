export declare function useRedeemWildcard(): {
    redeem: (userWildcardId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
