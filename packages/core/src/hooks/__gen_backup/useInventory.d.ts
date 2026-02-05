/**
 * useInventory Hook
 * Fetches user inventory
 * v0.36.3 - Equipment/inventory sync
 * v0.41.14 - Migrated SWR fetcher to unified API client
 */
export interface InventoryItem {
    id: string;
    userId?: string;
    itemId?: string;
    itemKey?: string | null;
    rarity: string;
    quantity?: number;
    equipped?: boolean;
    createdAt?: string;
    updatedAt?: string;
    name?: string;
    emoji?: string;
    icon?: string;
    description?: string | null;
    type?: string;
    goldPrice?: number;
}
/**
 * Hook for fetching user inventory
 * Uses SWR for automatic revalidation
 * v0.36.3 - Equipment/inventory sync
 */
export declare function useInventory(): {
    inventory: InventoryItem[];
    loading: boolean;
    error: string | null;
    total: number;
    reload: () => void;
};
