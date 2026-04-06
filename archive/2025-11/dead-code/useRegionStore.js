import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_REGION } from '@parel/core/config';
export const useRegionStore = create()(persist((set) => ({
    region: DEFAULT_REGION,
    language: "en",
    theme: "default",
    setRegion: (r) => set({ region: r }),
    setLanguage: (l) => set({ language: l }),
    setTheme: (t) => set({ theme: t }),
}), {
    name: "parel-region-store", // localStorage key
    version: 1,
}));
// TODO: review cross-platform region store (web/mobile compatibility)
