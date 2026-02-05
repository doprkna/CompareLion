interface UseSfxReturn {
    play: (key: string, volume?: number) => void;
    vibrate: (pattern?: number[]) => void;
}
export declare function useSfx(soundEnabled?: boolean, hapticsEnabled?: boolean): UseSfxReturn;
export {};
