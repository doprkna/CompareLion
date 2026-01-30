export declare function useMicroClans(seasonId?: string): {
    clans: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useClan(clanId: string | null): {
    clan: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useClanBuff(): {
    buff: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
