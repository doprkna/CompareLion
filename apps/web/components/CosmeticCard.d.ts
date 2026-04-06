import React from 'react';
export interface Price {
    stripePriceId?: string;
    currencyCode: string;
    unitAmount: number;
}
export interface CosmeticProduct {
    id: string;
    slug: string;
    title: string;
    description?: string;
    payload: {
        previewUrl: string;
        rarity: string;
        stackable?: boolean;
        autoEquip?: boolean;
    };
    prices: Price[];
}
interface CosmeticCardProps {
    product: CosmeticProduct;
    owned?: boolean;
    equipped?: boolean;
    onEquip?: () => void;
}
export default function CosmeticCard({ product, owned, equipped, onEquip }: CosmeticCardProps): React.JSX.Element;
export {};
