interface BadgeData {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity?: "common" | "rare" | "epic" | "legendary";
    xpReward?: number;
}
interface BadgeUnlockAnimationProps {
    badge: BadgeData;
    show: boolean;
    onClose: () => void;
}
export default function BadgeUnlockAnimation({ badge, show, onClose, }: BadgeUnlockAnimationProps): import("react").JSX.Element;
export {};
