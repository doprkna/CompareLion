/**
 * Region/theme store - minimal stub for build resolution.
 */

import { create } from 'zustand';

interface RegionState {
  region: string;
  setTheme: (name: string) => void;
}

export const useRegionStore = create<RegionState>(() => ({
  region: 'GLOBAL',
  setTheme: () => {},
}));
