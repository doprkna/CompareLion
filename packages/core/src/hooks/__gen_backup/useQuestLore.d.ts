export interface QuestLore {
    text: string;
    tone: 'serious' | 'comedic' | 'poetic';
}
export declare function useQuestLore(questId: string | null): {
    lore: QuestLore | null;
    loading: boolean;
    error: string | null;
    fetchLore: () => Promise<void>;
};
export declare function useQuestClaimWithLore(): {
    claimWithLore: (userQuestId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
    lore: QuestLore | null;
};
