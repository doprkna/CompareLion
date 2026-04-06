import React from 'react';
interface BuyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    price: {
        currencyCode: string;
        unitAmount: number;
    };
    onConfirm: (method: 'stripe' | 'funds' | 'diamonds') => void;
}
export declare function BuyDialog({ isOpen, onClose, productId, price, onConfirm }: BuyDialogProps): React.JSX.Element;
export {};
