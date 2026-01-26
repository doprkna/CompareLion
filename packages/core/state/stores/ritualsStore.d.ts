/**
 * Rituals Store
 * Zustand store for ritual data with user progress (multi-source aggregation, read-only)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
export interface Ritual {
    id: string;
    name: string;
    description: string;
    type: string;
    date: string;
    [key: string]: any;
}
export interface RitualUserProgress {
    completed: boolean;
    completedAt?: string | null;
    progress?: number;
    [key: string]: any;
}
export declare const useRitualsStore: UseBoundStore<StoreApi<import("..").AsyncStore<T>>>;
