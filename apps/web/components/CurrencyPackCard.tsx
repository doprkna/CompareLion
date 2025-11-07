"use client";
import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { logger } from '@/lib/logger';

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
  payload: { amount: number };
  prices: Price[];
}

export default function CurrencyPackCard({ product }: { product: CurrencyPackProduct }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.assign(data.url);
      }
    } catch (err) {
      logger.error('Checkout error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold">{product.title}</h3>
        {product.description && <p className="text-sm text-gray-600">{product.description}</p>}
        <div className="mt-2 font-medium text-blue-600">+{product.payload.amount} Funds</div>
      </div>
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {product.prices.map((p) => (
            <span key={p.currencyCode} className="text-sm bg-gray-100 px-2 py-1 rounded">
              {formatCurrency(p.unitAmount, p.currencyCode)}
            </span>
          ))}
        </div>
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Processing...' : 'Buy'}
        </button>
      </div>
    </div>
  );
}
