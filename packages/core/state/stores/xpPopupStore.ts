/**
 * XP Popup Store
 * Zustand store for XP popup UI state container
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */

'use client';

import { createStore } from '../factory';

export interface XpPopupProps {
  variant?: 'xp' | 'gold' | 'level';
}

export interface XpInstance {
  id: string;
  amount: number;
  offsetX: number;
  offsetY: number;
  variant: XpPopupProps['variant'];
}

let globalIdCounter = 0;

interface XpPopupStoreState {
  instances: XpInstance[];
  triggerXp: (
    amount: number,
    variant?: XpPopupProps['variant'],
    options?: { offsetX?: number; offsetY?: number }
  ) => void;
  removeInstance: (id: string) => void;
  clearAll: () => void;
}

export const useXpPopupStore = createStore<XpPopupStoreState>((set, get) => ({
  instances: [],

  triggerXp: (
    amount: number,
    variant: XpPopupProps['variant'] = 'xp',
    options?: { offsetX?: number; offsetY?: number }
  ) => {
    const id = `xp-${Date.now()}-${globalIdCounter++}`;

    // Randomize X offset slightly for natural feel when multiple popups
    const baseOffsetX = options?.offsetX ?? 0;
    const randomOffsetX = baseOffsetX + (Math.random() - 0.5) * 60;
    const randomOffsetY = options?.offsetY ?? (Math.random() - 0.5) * 20;

    const newInstance: XpInstance = {
      id,
      amount,
      offsetX: randomOffsetX,
      offsetY: randomOffsetY,
      variant,
    };

    set({ instances: [...get().instances, newInstance] });

    // Auto-remove after animation completes (preserve auto-cleanup logic)
    setTimeout(() => {
      const current = get();
      set({ instances: current.instances.filter((instance) => instance.id !== id) });
    }, 1600);
  },

  removeInstance: (id: string) => {
    set({ instances: get().instances.filter((instance) => instance.id !== id) });
  },

  clearAll: () => {
    set({ instances: [] });
  },
}));

