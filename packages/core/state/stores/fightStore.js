/**
 * Fight Store
 * Zustand store for fight system (migrated to unified state system)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useFightStore = createStore((set, get) => ({
    selectedEnemy: null,
    fightResult: null,
    isFighting: false,
    setEnemy: (enemy) => {
        set({ selectedEnemy: enemy });
    },
    runFight: async (enemyId) => {
        set({ isFighting: true, fightResult: null });
        try {
            const response = await defaultClient.post('/fight/start', { enemyId });
            const result = {
                id: response.data.fight.id,
                winner: response.data.fight.winner,
                rounds: response.data.fight.rounds,
                totalRounds: response.data.fight.totalRounds,
                xpReward: response.data.fight.xpReward,
                goldReward: response.data.fight.goldReward,
            };
            set({ fightResult: result, isFighting: false });
            return result;
        }
        catch (error) {
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
