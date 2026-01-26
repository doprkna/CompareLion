/**
 * Recipes Store
 * Zustand store for crafting recipes collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
export interface Recipe {
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
        isCraftable: boolean;
    };
    ingredients: Array<{
        itemId: string;
        quantity: number;
    }>;
    craftTime: number;
    xpReward: number;
    discoveredBy: string | null;
    createdAt: string;
}
export declare const useRecipesStore: any;
