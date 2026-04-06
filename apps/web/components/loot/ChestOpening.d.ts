/**
 * Chest Opening Component
 * Shows chest opening animation and reveals items
 * v0.36.30 - Loot System 2.0
 */
interface ChestReward {
    itemId: string;
    itemName: string;
    rarity: string;
    quantity: number;
}
interface ChestOpeningProps {
    show: boolean;
    chestType: string;
    items: ChestReward[];
    gold?: number;
    xp?: number;
    onClose: () => void;
}
export declare function ChestOpening({ show, chestType, items, gold, xp, onClose }: ChestOpeningProps): import("react").JSX.Element | null;
export {};
