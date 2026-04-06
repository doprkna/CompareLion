interface LootToastProps {
    show: boolean;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    message: string;
    onClose: () => void;
}
export declare function LootToast({ show, rarity, message, onClose }: LootToastProps): import("react").JSX.Element | null;
export {};
