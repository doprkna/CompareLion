/**
 * Item DTOs
 * Data transfer objects for items (shop items, inventory items, etc.)
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */
/**
 * Base Item DTO
 * Common item shape used across shop, items, and inventory endpoints
 */
export interface ItemDTO {
    /** Item ID */
    id: string;
    /** Item key/identifier */
    key: string;
    /** Item name */
    name: string;
    /** Emoji representation (optional) */
    emoji?: string | null;
    /** Icon representation (optional) */
    icon?: string | null;
    /** Item description (optional) */
    description?: string | null;
    /** Item rarity */
    rarity: string;
    /** Item type */
    type: string;
    /** Gold price (optional) */
    goldPrice?: number | null;
    /** Power stat (optional) */
    power?: number | null;
    /** Defense stat (optional) */
    defense?: number | null;
    /** Whether item is available in shop (optional) */
    isShopItem?: boolean;
    /** Region filter (optional) */
    region?: string | null;
}
/**
 * Shop Item DTO
 * Shop-specific item with price field (mapped from goldPrice)
 */
export interface ShopItemDTO extends ItemDTO {
    /** Price in gold (mapped from goldPrice) */
    price: number;
}
