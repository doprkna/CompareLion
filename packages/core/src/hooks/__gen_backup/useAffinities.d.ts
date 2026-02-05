export declare function useAffinities(): {
    affinities: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useAffinityActions(): {
    loading: boolean;
    error: string | null;
    request: (targetId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
    accept: (sourceId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
    remove: (targetId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
};
