/**
 * Badges Store
 * Zustand store for badges collections with computed selectors
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
export interface Badge {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'eternal';
    unlockType: 'level' | 'event' | 'season' | 'special';
    requirementValue?: string | null;
    rewardType?: 'currency' | 'item' | 'title' | null;
    rewardValue?: string | null;
    seasonId?: string | null;
    isUnlocked?: boolean;
    unlockedAt?: string;
    claimedAt?: string | null;
    isClaimed?: boolean;
    canClaim?: boolean;
    userBadgeId?: string;
}
export declare const useBadgesStore: any;
export declare const useUserBadgesStore: any;
