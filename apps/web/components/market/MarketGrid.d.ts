import { MarketItem } from '@parel/core/hooks/useMarket';
interface MarketGridProps {
    items: MarketItem[];
    loading?: boolean;
    onPurchase?: (item: MarketItem) => void;
    purchasingItemId?: string | null;
    walletBalances?: Record<string, number>;
}
export declare function MarketGrid({ items, loading, onPurchase, purchasingItemId, walletBalances }: MarketGridProps): import("react").JSX.Element;
export {};
