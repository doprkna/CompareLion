/**
 * Chronicle Store
 * Zustand store for chronicle data with nested stats and season (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
export interface ChronicleStats {
    reflectionCount: number;
    xpGained: number;
    dominantSentiment: string;
    sentimentCounts: Record<string, number>;
    mostActiveDay?: string;
    periodStart: string;
    periodEnd: string;
}
export interface ChronicleSeason {
    id: string;
    name: string;
    displayName: string;
}
export interface Chronicle {
    id: string;
    type: 'weekly' | 'seasonal';
    summaryText: string;
    stats: ChronicleStats;
    quote?: string | null;
    generatedAt: string;
    season?: ChronicleSeason | null;
}
export declare const useChronicleStore: any;
