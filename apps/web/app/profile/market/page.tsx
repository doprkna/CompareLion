"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarket } from '@/hooks/useMarket';
import { useGold } from '@/hooks/useGold';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ShoppingBag, Coins, Gem, ArrowLeft } from 'lucide-react';

type TabType = 'browse' | 'my-listings' | 'activity';

export default function MarketPage() {
  const { listings, loading, buyListing, cancelListing } = useMarket();
  const { gold, loading: goldLoading } = useGold();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const handleBuy = async (listingId: string) => {
    setPurchasing(listingId);
    try {
      await buyListing(listingId);
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancel = async (listingId: string) => {
    setCancelling(listingId);
    try {
      await cancelListing(listingId);
    } finally {
      setCancelling(null);
    }
  };

  const RARITY_COLORS: Record<string, string> = {
    common: 'border-gray-500 text-gray-300',
    uncommon: 'border-green-500 text-green-300',
    rare: 'border-blue-500 text-blue-300',
    epic: 'border-purple-500 text-purple-300',
    legendary: 'border-yellow-500 text-yellow-300',
    alpha: 'border-amber-500 text-amber-300 border-2',
  };

  const getCurrencyEmoji = (currencyKey: string) => {
    return currencyKey === 'gold' ? '🪙' : '💎';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="text-accent hover:underline mb-2 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-text">Marketplace</h1>
          </div>
          {/* Wallet Balance */}
          <div className="flex items-center gap-4 text-lg">
            <div className="flex items-center gap-2 font-bold text-yellow-400">
              <Coins className="h-5 w-5" />
              {goldLoading ? '...' : gold.toLocaleString()} 🪙
            </div>
          </div>
        </div>
        <p className="text-subtle">Buy and sell items with other players</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'browse'
              ? 'text-accent border-b-2 border-accent'
              : 'text-subtle hover:text-text'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'my-listings'
              ? 'text-accent border-b-2 border-accent'
              : 'text-subtle hover:text-text'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-accent border-b-2 border-accent'
              : 'text-subtle hover:text-text'
          }`}
        >
          Activity
        </button>
      </div>

      {/* Content */}
      <Card className="bg-card border-2 border-border">
        <div className="p-6">
          {activeTab === 'browse' && (
            <>
              {loading ? (
                <SkeletonLoader variant="card" count={3} />
              ) : listings.length === 0 ? (
                <div className="text-center py-12 text-subtle">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No active listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => {
                    const rarityColor = RARITY_COLORS[listing.item.rarity] || RARITY_COLORS.common;
                    const canAfford = listing.currencyKey === 'gold' ? gold >= listing.price : false; // TODO: Check diamonds
                    const isPurchasing = purchasing === listing.id;

                    return (
                      <div
                        key={listing.id}
                        className={`border-2 rounded-xl p-4 ${rarityColor} bg-card hover:bg-bg transition-all`}
                      >
                        {/* Item Info */}
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{listing.item.emoji}</div>
                          <h3 className="font-bold text-lg">{listing.item.name}</h3>
                          <p className="text-xs text-subtle uppercase mt-1">
                            {listing.item.rarity}
                          </p>
                        </div>

                        {/* Stats */}
                        {(listing.item.power || listing.item.defense) && (
                          <div className="flex justify-center gap-3 text-xs mb-3">
                            {listing.item.power && (
                              <div className="text-red-400">⚔️ {listing.item.power}</div>
                            )}
                            {listing.item.defense && (
                              <div className="text-blue-400">🛡️ {listing.item.defense}</div>
                            )}
                          </div>
                        )}

                        {/* Seller */}
                        <div className="text-center text-xs text-subtle mb-3">
                          by {listing.seller.username || listing.seller.name || 'Player'}
                        </div>

                        {/* Price */}
                        <div className="text-center mb-3">
                          <div className="text-2xl font-bold text-yellow-400">
                            {listing.price.toLocaleString()} {getCurrencyEmoji(listing.currencyKey)}
                          </div>
                        </div>

                        {/* Buy Button */}
                        <Button
                          onClick={() => handleBuy(listing.id)}
                          disabled={!canAfford || isPurchasing}
                          className={`w-full ${!canAfford ? 'bg-gray-600' : ''}`}
                        >
                          {isPurchasing ? (
                            '⏳ Purchasing...'
                          ) : !canAfford ? (
                            `⛔ Not enough ${listing.currencyKey}`
                          ) : (
                            `🛒 Buy Now`
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'my-listings' && (
            <div className="text-center py-12 text-subtle">
              <p>My Listings - Coming soon</p>
              <p className="text-xs mt-2">This will show your active and sold listings</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-12 text-subtle">
              <p>Activity - Coming soon</p>
              <p className="text-xs mt-2">Recent marketplace transactions</p>
            </div>
          )}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 bg-card border border-border">
        <div className="p-4 text-center text-sm text-subtle">
          💡 5% marketplace fee on all sales. Items are locked while listed.
        </div>
      </Card>
    </div>
  );
}

