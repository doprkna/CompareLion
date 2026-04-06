/**
 * Sell Modal Component
 * Modal for creating marketplace listings
 * v0.36.39 - Marketplace 2.0
 */
interface SellModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}
export declare function SellModal({ open, onOpenChange, onSuccess }: SellModalProps): import("react").JSX.Element;
export {};
