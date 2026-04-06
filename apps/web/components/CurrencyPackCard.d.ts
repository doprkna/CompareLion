import React from 'react';
export interface Price {
    stripePriceId?: string;
    currencyCode: string;
    unitAmount: number;
}
export interface CurrencyPackProduct {
    id: string;
    slug: string;
    title: string;
    description?: string;
    payload: {
        amount: number;
    };
    prices: Price[];
}
export default function CurrencyPackCard({ product }: {
    product: CurrencyPackProduct;
}): React.JSX.Element;
