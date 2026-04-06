/**
 * Shop Cosmetics Integration (v0.8.9)
 *
 * PLACEHOLDER: Unified shop for avatar parts, themes, and collectibles.
 */
export interface CosmeticItem {
    id: string;
    name: string;
    description: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    cosmeticType: "avatar_layer" | "theme" | "aura" | "frame" | "particle";
    cosmeticSubtype?: string;
    icon: string;
    visualConfig?: {
        colors?: string[];
        pattern?: string;
        animation?: string;
    };
    goldPrice?: number;
    diamondPrice?: number;
    eventCurrency?: string;
    eventPrice?: number;
    isFeatured: boolean;
    isLimited: boolean;
    availableUntil?: Date;
    isOwned?: boolean;
    isEquipped?: boolean;
}
export declare const RARITY_COLORS: {
    common: string;
    uncommon: string;
    rare: string;
    epic: string;
    legendary: string;
};
export declare const RARITY_GLOW: {
    common: string;
    uncommon: string;
    rare: string;
    epic: string;
    legendary: string;
};
export declare const COSMETIC_ITEMS: CosmeticItem[];
export declare function filterCosmetics(items: CosmeticItem[], options: {
    type?: string;
    rarity?: string;
    ownedOnly?: boolean;
    sortBy?: "rarity" | "price" | "name";
}): CosmeticItem[];
export declare function purchaseCosmetic(userId: string, itemId: string): Promise<null>;
