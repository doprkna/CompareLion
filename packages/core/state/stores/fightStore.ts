/**
 * Fight Store
 * Zustand store for fight system (migrated to unified state system)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */

'use client';

import { createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  str: number;
  def: number;
  speed: number;
  rarity: string;
  xpReward: number;
  goldReward: number;
  sprite?: string | null;
}

export interface FightResult {
  id: string;
  winner: string;
  rounds: Array<{
    round: number;
    attacker: string;
    defender: string;
    damage: number;
    attackerHpAfter: number;
    defenderHpAfter: number;
  }>;
  totalRounds: number;
  xpReward: number;
  goldReward: number;
}

interface FightStoreState {
  selectedEnemy: Enemy | null;
  fightResult: FightResult | null;
  isFighting: boolean;
  setEnemy: (enemy: Enemy | null) => void;
  runFight: (enemyId: string) => Promise<FightResult | null>;
  clearFight: () => void;
}

export const useFightStore = createStore<FightStoreState>((set, get) => ({
  selectedEnemy: null,
  fightResult: null,
  isFighting: false,

  setEnemy: (enemy: Enemy | null) => {
    set({ selectedEnemy: enemy });
  },

  runFight: async (enemyId: string) => {
    set({ isFighting: true, fightResult: null });

    try {
      const response = await defaultClient.post<{ fight: FightResult }>('/fight/start', { enemyId });
      
      const result: FightResult = {
        id: response.data.fight.id,
        winner: response.data.fight.winner,
        rounds: response.data.fight.rounds,
        totalRounds: response.data.fight.totalRounds,
        xpReward: response.data.fight.xpReward,
        goldReward: response.data.fight.goldReward,
      };

      set({ fightResult: result, isFighting: false });
      return result;
    } catch (error) {
      console.error('[FightStore] Fight error:', error);
      set({ isFighting: false });
      return null;
    }
  },

  clearFight: () => {
    set({
      selectedEnemy: null,
      fightResult: null,
      isFighting: false,
    });
  },
}));

