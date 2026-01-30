/**
 * Discoveries Store
 * Zustand store for item discoveries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
export interface Discovery {
    id: string;
    itemId: string;
    item: {
        id: string;
        name: string;
        type: string;
        rarity: string;
        description: string | null;
        icon: string | null;
        emoji: string | null;
        category: string | null;
    };
    discoveredAt: string;
}
export declare const useDiscoveriesStore: any;
