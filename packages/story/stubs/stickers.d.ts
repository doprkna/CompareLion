/** @parel/story stub - build resolution only */
export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}
export declare const STICKERS: Sticker[];
export declare function getAllStickers(): Sticker[];
export declare function parseStickerType(type: string): string | null;
