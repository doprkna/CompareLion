export interface Quest {
    id: string;
    questId: string;
    userQuestId?: string | null;
    key: string;
    lore?: {
        text: string;
        tone: 'serious' | 'comedic' | 'poetic';
    } | null;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'story' | 'side';
    requirementType: 'xp' | 'reflections' | 'gold' | 'missions' | 'custom';
    requirementValue: number;
    rewardXP: number;
    rewardGold: number;
    rewardItem?: string | null;
    rewardBadge?: string | null;
    rewardKarma: number;
    isRepeatable: boolean;
    progress: number;
    progressPercent: number;
    isCompleted: boolean;
    isClaimed: boolean;
    canClaim: boolean;
    startedAt?: string;
    completedAt?: string | null;
}
export declare function useQuests(): {
    quests: any;
    loading: any;
    error: any;
    reload: () => Promise<void>;
};
export declare function useActiveQuests(): {
    quests: any;
    loading: any;
    error: any;
    reload: () => Promise<void>;
};
export declare function useClaimQuest(): {
    claim: (userQuestId: string) => Promise<any>;
    loading: any;
    error: any;
};
