/**
 * useFightStore Hook
 * v0.36.0 - Full Fighting System MVP
 * v0.41.20 - Migrated to unified state store
 */

"use client";

import { useFightStore as useFightStoreBase } from '../state/stores/fightStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import type { Enemy, FightResult } from '../state/stores/fightStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { Enemy, FightResult };

// Re-export the store hook
export const useFightStore = useFightStoreBase;

