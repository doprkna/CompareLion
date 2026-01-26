'use client';

import { WalletBalance } from '@parel/core/hooks/useMarket';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Gem, Heart } from 'lucide-react';

interface WalletDisplayProps {
  wallets: WalletBalance[];
  loading?: boolean;
}

const currencyIcons: Record<string, typeof Coins> = {
  gold: Coins,
  diamonds: Gem,
  karma: Heart,
};

export function WalletDisplay({ wallets, loading }: WalletDisplayProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter to show only currencies with balance > 0 or main currencies
  const visibleWallets = wallets.filter((w) => w.balance > 0 || ['gold', 'diamonds', 'karma'].includes(w.currencyKey));

  if (visibleWallets.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-sm text-subtle">No wallet data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          {visibleWallets.map((wallet) => {
            const Icon = currencyIcons[wallet.currencyKey] || Coins;
            return (
              <div
                key={wallet.currencyKey}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20"
              >
                <Icon className="w-5 h-5 text-accent" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-subtle uppercase">{wallet.currencyKey}</span>
                  <span className="text-sm font-bold text-text">
                    {wallet.symbol} {wallet.balance.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}




