/**
 * Lore Store
 * Zustand store for lore entries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
export interface LoreEntry {
    id: string;
    sourceType: 'reflection' | 'quest' | 'item' | 'event' | 'system';
    sourceId?: string | null;
    tone: 'serious' | 'comedic' | 'poetic';
    text: string;
    createdAt: string;
}
export interface LorePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare const useLoreStore: any;
