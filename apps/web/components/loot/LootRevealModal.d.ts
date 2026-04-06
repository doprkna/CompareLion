interface LootRevealModalProps {
    show: boolean;
    loot: {
        id: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        rewardType: 'xp' | 'gold' | 'item' | 'cosmetic' | 'emote';
        rewardValue: number;
        flavorText?: string;
    };
    onRedeem: (lootId: string) => Promise<void>;
    onClose: () => void;
    redeeming?: boolean;
}
export declare function LootRevealModal({ show, loot, onRedeem, onClose, redeeming, }: LootRevealModalProps): import("react").JSX.Element | null;
export {};
