import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Region, DEFAULT_REGION } from "@/lib/config/regions";

type RegionState = {
  region: Region;
  setRegion: (r: Region) => void;
  language: string;
  setLanguage: (l: string) => void;
  theme: string;
  setTheme: (t: string) => void;
};

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: DEFAULT_REGION,
      language: "en",
      theme: "default",
      setRegion: (r) => set({ region: r }),
      setLanguage: (l) => set({ language: l }),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: "parel-region-store", // localStorage key
      version: 1,
    }
  )
);

