export declare function useLootMoments(limit?: number): {
    loot: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useLootCheck(): {
    check: (trigger: "reflection" | "mission" | "comparison" | "levelup" | "random") => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useLootRedeem(): {
    redeem: (lootId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
