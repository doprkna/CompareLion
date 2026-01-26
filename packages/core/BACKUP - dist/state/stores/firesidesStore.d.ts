/**
 * Firesides Store
 * Zustand store for firesides collection and individual fireside with reactions (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
export interface Fireside {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    authorId: string;
    author?: {
        id: string;
        name: string;
        avatar?: string | null;
    };
    [key: string]: any;
}
export interface FiresideReaction {
    id: string;
    firesideId: string;
    userId: string;
    emoji: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        avatar?: string | null;
    };
}
export declare const useFiresidesStore: any;
export declare const useFiresideStore: any;
