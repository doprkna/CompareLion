export declare function useFactions(region?: string | null): {
    factions: any[];
    userFaction: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useJoinFaction(): {
    join: (factionId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useFactionMap(region?: string | null): {
    map: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useFactionContribution(): {
    contribute: (amount: number, region?: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
