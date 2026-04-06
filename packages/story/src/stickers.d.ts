/**
 * Story Sticker Catalog
 * Static sticker definitions for story reactions
 * v0.40.6 - Story Reactions + Stickers 1.0
 */
export interface Sticker {
    id: string;
    emoji: string;
    label: string;
}
export declare const STICKERS: Sticker[];
export declare function getStickerById(id: string): Sticker | undefined;
export declare function getAllStickers(): Sticker[];
/**
 * Parse sticker reaction type
 * Returns stickerId if type is "sticker:<id>", null otherwise
 */
export declare function parseStickerType(type: string): string | null;
/**
 * Format sticker reaction type
 */
export declare function formatStickerType(stickerId: string): string;
