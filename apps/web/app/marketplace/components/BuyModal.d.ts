/**
 * Buy Modal Component
 * Modal for confirming marketplace purchases
 * v0.36.39 - Marketplace 2.0
 */
import { CurrencyType } from '@/lib/marketplace/types';
interface Listing {
    id: string;
    price: number;
    quantity: number;
    currency: CurrencyType;
    item: {
        id: string;
        name: string;
        emoji?: string | null;
        icon?: string | null;
        rarity: string;
        type: string;
    };
    seller: {
        id: string;
        name: string;
        username?: string;
    };
}
interface BuyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    listing: Listing | null;
    userBalance: {
        gold: number;
        diamonds: number;
    };
    onSuccess?: () => void;
}
export declare function BuyModal({ open, onOpenChange, listing, userBalance, onSuccess }: BuyModalProps): import("react").JSX.Element | null;
export {};
