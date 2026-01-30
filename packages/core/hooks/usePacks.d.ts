export declare function usePacks(): {
    packs: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function usePack(id: string | null): {
    pack: any;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useUnlockPack(): {
    unlock: (packId: string) => Promise<boolean>;
    loading: boolean;
    error: string | null;
};
