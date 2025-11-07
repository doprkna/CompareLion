'use client';

import { MarketItem } from '@/hooks/useMarket';
import { MarketItemCard } from './MarketItemCard';
import { Loader2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MarketGridProps {
  items: MarketItem[];
  loading?: boolean;
  onPurchase?: (item: MarketItem) => void;
  purchasingItemId?: string | null;
  walletBalances?: Record<string, number>;
}

export function MarketGrid({ items, loading, onPurchase, purchasingItemId, walletBalances = {} }: MarketGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-subtle" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-subtle" />
          <h3 className="text-xl font-semibold text-text mb-2">No Items Available</h3>
          <p className="text-subtle">Items will appear here as they become available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <MarketItemCard
          key={item.id}
          item={item}
          onPurchase={onPurchase ? () => onPurchase(item) : undefined}
          purchasing={purchasingItemId === item.id}
          userBalance={walletBalances[item.currencyKey] || 0}
        />
      ))}
    </div>
  );
}




