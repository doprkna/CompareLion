import { MarketItem } from '@parel/core/hooks/useMarket';
interface MarketItemCardProps {
    item: MarketItem;
    onPurchase?: () => void;
    purchasing?: boolean;
    userBalance?: number;
}
export declare function MarketItemCard({ item, onPurchase, purchasing, userBalance }: MarketItemCardProps): import("react").JSX.Element;
export {};
