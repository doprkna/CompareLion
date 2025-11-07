"use client";

import Link from 'next/link';
import { RpgPanelLayout } from '@/components/rpg/RpgPanelLayout';
import { WalletBar } from '@/components/rpg/WalletBar';
import ShopPanel from '@/components/shop/ShopPanel';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { AmbientManager } from '@/components/AmbientManager'; // v0.26.14

export default function ShopPage() {
  return (
    <>
      <AmbientManager mode="shop" /> {/* v0.26.14 */}
      <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Wallet Bar */}
        <div className="mb-6">
          <Link href="/profile" className="text-accent hover:underline mb-3 inline-flex items-center gap-1 text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                <h1 className="text-3xl sm:text-4xl font-bold text-text">Shop</h1>
              </div>
              <p className="text-subtle text-sm sm:text-base">Spend your hard-earned gold on powerful items</p>
            </div>
            <WalletBar showDiamonds={false} />
          </div>
        </div>

        {/* Shop Panel in Unified Layout */}
        <RpgPanelLayout title="Available Items" icon={<ShoppingBag className="h-5 w-5 text-purple-400" />}>
          <ShopPanel />
        </RpgPanelLayout>

        {/* Info Box */}
        <RpgPanelLayout title="Earning Gold" className="bg-gray-800/40">
          <p className="text-center text-sm text-gray-300">
            💡 Earn gold by defeating enemies in combat, completing achievements, and more!
          </p>
        </RpgPanelLayout>
      </div>
    </div>
    </>
  );
}

