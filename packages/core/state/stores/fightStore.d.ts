/**
 * Fight Store
 * Zustand store for fight system (migrated to unified state system)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
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
export declare const useFightStore: UseBoundStore<StoreApi<T>>;
