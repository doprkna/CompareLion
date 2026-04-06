interface RarityLabelProps {
    rarity?: {
        key?: string;
        name?: string;
        colorPrimary?: string;
        colorGlow?: string;
        frameStyle?: string;
        rankOrder?: number;
        description?: string;
    } | string | null;
    showTooltip?: boolean;
    className?: string;
}
export declare function RarityLabel({ rarity, showTooltip, className }: RarityLabelProps): import("react").JSX.Element | null;
export {};
