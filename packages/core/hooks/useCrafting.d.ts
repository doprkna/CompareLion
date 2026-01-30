interface CraftResult {
    success: boolean;
    message: string;
    item: {
        id: string;
        itemId: string;
        quantity: number;
    };
    isNewDiscovery: boolean;
    xpReward: number;
    newXP: number;
    newLevel: number;
}
export declare function useCrafting(): {
    craft: (recipeId: string) => Promise<CraftResult>;
    loading: boolean;
    error: string | null;
};
export {};
