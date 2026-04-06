export interface RewardItem {
    type: 'xp' | 'gold' | 'diamonds' | 'hearts' | 'food';
    amount: number;
    label: string;
    emoji: string;
    color: string;
}
export interface DropItem {
    id: string;
    name: string;
    price: number;
    currency: 'gold' | 'diamond';
    icon: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}
export interface RewardModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    rewards: RewardItem[];
    drops?: DropItem[];
    stats?: Array<{
        label: string;
        value: string | number;
    }>;
    actions: Array<{
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'ghost';
        primary?: boolean;
    }>;
    type?: 'success' | 'neutral' | 'warning';
}
export declare function RewardModal({ open, onClose, title, subtitle, rewards, drops, stats, actions, type, }: RewardModalProps): import("react").JSX.Element;
