import type { Fireside, FiresideReaction } from '../state/stores/firesidesStore';
export type { Fireside, FiresideReaction };
export declare function useFiresides(): {
    firesides: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useFireside(id: string | null): {
    fireside: any;
    reactions: any;
    loading: any;
    error: any;
    reload: () => void;
};
export declare function useFiresideReactions(id: string | null): {
    fireside: any;
    reactions: any;
    post: any;
    posting: any;
    reload: () => void;
};
