'use client';

import { MarketItem } from '@/hooks/useMarket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Gift, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketItemCardProps {
  item: MarketItem;
  onPurchase?: () => void;
  purchasing?: boolean;
  userBalance?: number; // Balance for item's currency
}

const categoryIcons = {
  item: Gift,
  cosmetic: Sparkles,
  booster: Zap,
};

const rarityColors = {
  common: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  rare: 'bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-300',
  epic: 'bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-300',
  legendary: 'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-300',
};

export function MarketItemCard({ item, onPurchase, purchasing, userBalance = 0 }: MarketItemCardProps) {
  const Icon = categoryIcons[item.category];
  const canAfford = userBalance >= item.price;
  const isOutOfStock = item.stock !== null && item.stock <= 0;
  const currencySymbol = item.currencyKey === 'gold' ? '🪙' : item.currencyKey === 'diamonds' ? '💎' : '⭐';

  return (
    <Card className={cn(
      'relative transition-all',
      item.isEventItem && 'border-2 border-accent bg-accent/5',
      isOutOfStock && 'opacity-60'
    )}>
      {item.isEventItem && (
        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-accent/20 text-accent border border-accent/30">
          Event
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {item.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{item.description}</CardDescription>
          </div>
          {item.rarity && (
            <span className={cn('px-2 py-1 text-xs rounded-full font-medium', rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.common)}>
              {item.rarity}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-subtle">Price:</span>
          <span className="text-lg font-bold text-text">
            {currencySymbol} {item.price.toFixed(0)}
          </span>
        </div>

        {/* Stock */}
        {item.stock !== null && (
          <div className="text-xs text-subtle">
            Stock: {item.stock} remaining
          </div>
        )}

        {/* Purchase Button */}
        {isOutOfStock ? (
          <Button disabled variant="outline" className="w-full">
            Sold Out
          </Button>
        ) : !canAfford ? (
          <Button disabled variant="outline" className="w-full">
            Insufficient Funds
          </Button>
        ) : onPurchase ? (
          <Button
            onClick={onPurchase}
            disabled={purchasing}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {purchasing ? 'Purchasing...' : 'Purchase'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}




