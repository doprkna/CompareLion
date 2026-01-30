export declare function useRoastLevel(): {
    roastLevel: number;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useSetRoastLevel(): {
    setLevel: (level: number) => Promise<any>;
    loading: boolean;
    error: string | null;
};
