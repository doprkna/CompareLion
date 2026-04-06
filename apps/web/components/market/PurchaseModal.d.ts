import { MarketItem } from '@parel/core/hooks/useMarket';
interface PurchaseModalProps {
    item: MarketItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    purchasing?: boolean;
    walletBalance?: number;
    success?: boolean;
}
export declare function PurchaseModal({ item, isOpen, onClose, onConfirm, purchasing, walletBalance, success, }: PurchaseModalProps): import("react").JSX.Element | null;
export {};
