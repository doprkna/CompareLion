/**
 * Fight Store - Zustand store for fight system
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { create } from "zustand";

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

interface FightState {
  selectedEnemy: Enemy | null;
  fightResult: FightResult | null;
  isFighting: boolean;
  setEnemy: (enemy: Enemy | null) => void;
  runFight: (enemyId: string) => Promise<FightResult | null>;
  clearFight: () => void;
}

export const useFightStore = create<FightState>((set, get) => ({
  selectedEnemy: null,
  fightResult: null,
  isFighting: false,

  setEnemy: (enemy) => {
    set({ selectedEnemy: enemy });
  },

  runFight: async (enemyId: string) => {
    set({ isFighting: true, fightResult: null });

    try {
      const response = await fetch("/api/fight/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enemyId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Fight failed");
      }

      const data = await response.json();
      const result: FightResult = {
        id: data.fight.id,
        winner: data.fight.winner,
        rounds: data.fight.rounds,
        totalRounds: data.fight.totalRounds,
        xpReward: data.fight.xpReward,
        goldReward: data.fight.goldReward,
      };

      set({ fightResult: result, isFighting: false });
      return result;
    } catch (error) {
      console.error("[FightStore] Fight error:", error);
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

