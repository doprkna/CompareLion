/**
 * useQuestLore Hook
 * Fetches quest lore
 * v0.41.14 - Migrated GET call to unified API client
 */
export interface QuestLore {
    text: string;
    tone: 'serious' | 'comedic' | 'poetic';
}
export declare function useQuestLore(questId: string | null): {
    lore: any;
    loading: any;
    error: any;
    fetchLore: () => Promise<void>;
};
export declare function useQuestClaimWithLore(): {
    claimWithLore: (userQuestId: string) => Promise<any>;
    loading: any;
    error: any;
    lore: any;
};
