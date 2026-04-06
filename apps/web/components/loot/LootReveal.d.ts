/**
 * Loot Reveal Component
 * Shows item drop with rarity color and animation
 * v0.36.30 - Loot System 2.0
 */
interface LootRevealProps {
    show: boolean;
    item: {
        id: string;
        name: string;
        emoji?: string;
        icon?: string;
        rarity: string;
    };
    onClose: () => void;
}
export declare function LootReveal({ show, item, onClose }: LootRevealProps): import("react").JSX.Element | null;
export {};
