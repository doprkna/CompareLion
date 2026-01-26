/**
 * useShop Hook
 * Manages shop items fetching and purchase logic
 * v0.26.2 - Economy Feedback & Shop Loop
 * v0.41.12 - Migrated to unified API client
 */
export interface ShopItem {
    id: string;
    key: string | null;
    name: string;
    emoji: string;
    description: string | null;
    price: number;
    rarity: string;
    type: string;
    power: number | null;
    defense: number | null;
}
export interface UseShopReturn {
    items: ShopItem[];
    loading: boolean;
    error: string | null;
    purchaseItem: (key: string) => Promise<boolean>;
    refetch: () => Promise<void>;
}
export declare function useShop(): UseShopReturn;
