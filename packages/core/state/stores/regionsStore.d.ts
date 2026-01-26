/**
 * Regions Store
 * Zustand store for regions collection with active region selection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
export interface Region {
    id: string;
    key: string;
    name: string;
    description: string;
    orderIndex: number;
    buffType: 'xp' | 'gold' | 'mood' | 'reflection';
    buffValue: number;
    unlockRequirementType?: 'level' | 'task' | 'gold' | 'achievement' | null;
    unlockRequirementValue?: string | null;
    isActive?: boolean;
    isUnlocked?: boolean;
    canUnlock?: boolean;
}
export declare const useRegionsStore: UseBoundStore<StoreApi<T>>;
