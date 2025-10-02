"use client";
import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

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

export default function CosmeticCard({ product, owned = false, equipped = false, onEquip }: CosmeticCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async (payment: 'funds' | 'diamonds') => {
    setLoading(true);
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1, payment }),
      });
      const data = await res.json();
      if (data.success) {
        // Optionally auto-equip
        if (product.payload.autoEquip && onEquip) onEquip();
      }
    } catch (err) {
      console.error('Purchase error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <img src={product.payload.previewUrl} alt={product.title} className="w-full h-32 object-cover rounded" />
      <h3 className="mt-2 text-lg font-semibold">{product.title}</h3>
      <p className="text-sm text-gray-600">Rarity: {product.payload.rarity}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {product.prices.map((p) => (
          <span key={p.currencyCode} className="text-sm bg-gray-100 px-2 py-1 rounded">
            {formatCurrency(p.unitAmount, p.currencyCode)}
          </span>
        ))}
      </div>
      <div className="mt-auto flex gap-2">
        {owned ? (
          <button
            onClick={onEquip}
            disabled={loading || equipped}
            className={`flex-1 py-2 rounded border font-medium ${equipped ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {equipped ? 'Equipped' : 'Equip'}
          </button>
        ) : (
          product.prices.map((p) => (
            <button
              key={p.currencyCode}
              onClick={() => handleBuy(p.currencyCode === 'DIAMONDS' ? 'diamonds' : 'funds')}
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              Buy ({formatCurrency(p.unitAmount, p.currencyCode)})
            </button>
          ))
        )}
      </div>
    </div>
  );
}
