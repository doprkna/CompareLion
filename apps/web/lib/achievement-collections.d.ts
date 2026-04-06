/**
 * Achievement Collection System (v0.8.8)
 *
 * PLACEHOLDER: Organize achievements into collectible sets.
 */
export interface AchievementCollectionData {
    collectionId: string;
    name: string;
    description: string;
    theme: "Courage" | "Wisdom" | "Chaos" | "Balance" | "Seasonal" | "Event";
    icon: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    achievements: string[];
    rewards: {
        title?: string;
        xp?: number;
        gold?: number;
        diamonds?: number;
        aura?: string;
        theme?: string;
    };
    isSeasonal?: boolean;
    seasonType?: "spring" | "summer" | "fall" | "winter";
    isEvent?: boolean;
    eventId?: string;
}
export declare const ACHIEVEMENT_COLLECTIONS: AchievementCollectionData[];
export declare function updateCollectionProgress(userId: string, achievementCode: string): Promise<null>;
export declare function claimCollectionReward(userId: string, collectionId: string): Promise<null>;
export declare function getCollectionProgress(userAchievements: string[], collection: AchievementCollectionData): {
    earned: number;
    total: number;
    percentage: number;
    isComplete: boolean;
};
