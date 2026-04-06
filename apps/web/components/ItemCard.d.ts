/**
 * ItemCard Component
 *
 * Displays an inventory item with rarity-based colors and type icons.
 */
interface ItemCardProps {
    item: {
        id: string;
        name: string;
        type: string;
        rarity: string;
        description?: string | null;
        power?: number | null;
        defense?: number | null;
        effect?: string | null;
        bonus?: string | null;
        icon?: string | null;
        effectKey?: string | null;
    };
    quantity?: number;
    equipped?: boolean;
    onClick?: () => void;
}
export default function ItemCard({ item, quantity, equipped, onClick }: ItemCardProps): import("react").JSX.Element;
export {};
