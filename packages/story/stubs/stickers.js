/** @parel/story stub - build resolution only. Minimal sticker data for UI. */
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

export function getAllStickers() {
  return STICKERS;
}

export function parseStickerType(type) {
  if (typeof type === 'string' && type.startsWith('sticker:')) {
    return type.substring(8);
  }
  return null;
}
