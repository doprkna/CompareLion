export interface BadgeUnlockEvent {
    userId: string;
    userName: string;
    badgeId: string;
    badgeKey: string;
    name: string;
    icon: string;
    rarity: string;
    rewardType?: string | null;
    rewardValue?: string | null;
}
export declare function useBadgeNotification(onUnlock?: (badge: BadgeUnlockEvent) => void): {
    pendingUnlock: BadgeUnlockEvent | null;
    clearPending: () => void;
};
