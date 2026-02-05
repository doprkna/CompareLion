export declare function useCommunityCreations(type?: string | null): {
    creations: any[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useSubmitCreation(): {
    submit: (data: {
        title: string;
        type: "question" | "mission" | "item" | "other";
        content: any;
        rewardXP?: number;
        rewardKarma?: number;
    }) => Promise<any>;
    loading: boolean;
    error: string | null;
};
export declare function useLikeCreation(): {
    like: (creationId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
