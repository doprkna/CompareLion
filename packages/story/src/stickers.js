/**
 * Story Sticker Catalog
 * Static sticker definitions for story reactions
 * v0.40.6 - Story Reactions + Stickers 1.0
 */
export const STICKERS = [
    { id: 'fire', emoji: '🔥', label: 'Fire' },
    { id: 'laugh', emoji: '😂', label: 'Laugh' },
    { id: 'cool', emoji: '😎', label: 'Cool' },
    { id: 'skull', emoji: '💀', label: 'Skull' },
    { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
    { id: 'orange_heart', emoji: '🧡', label: 'Orange Heart' },
    { id: 'chaos', emoji: 'CHAOS', label: 'Chaos' },
    { id: 'cozy', emoji: 'COZY', label: 'Cozy' },
    { id: 'wtf', emoji: 'WTF', label: 'WTF' },
];
export function getStickerById(id) {
    return STICKERS.find((s) => s.id === id);
}
export function getAllStickers() {
    return STICKERS;
}
/**
 * Parse sticker reaction type
 * Returns stickerId if type is "sticker:<id>", null otherwise
 */
export function parseStickerType(type) {
    if (type.startsWith('sticker:')) {
        return type.substring(8); // Remove "sticker:" prefix
    }
    return null;
}
/**
 * Format sticker reaction type
 */
export function formatStickerType(stickerId) {
    return `sticker:${stickerId}`;
}
