interface LootHistoryProps {
    loot: Array<{
        id: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        rewardType: 'xp' | 'gold' | 'item' | 'cosmetic' | 'emote';
        rewardValue: number;
        flavorText?: string;
        triggeredAt: string;
        redeemedAt: string | null;
        isRedeemed: boolean;
    }>;
    onRedeem?: (lootId: string) => Promise<void>;
    redeeming?: string | null;
}
export declare function LootHistory({ loot, onRedeem, redeeming }: LootHistoryProps): import("react").JSX.Element;
export {};
