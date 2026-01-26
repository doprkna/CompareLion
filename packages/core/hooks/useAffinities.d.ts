export declare function useAffinities(): {
    affinities: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useAffinityActions(): {
    loading: any;
    error: any;
    request: (targetId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
    accept: (sourceId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
    remove: (targetId: string, type: "friend" | "rival" | "mentor" | "romance") => Promise<boolean>;
};
