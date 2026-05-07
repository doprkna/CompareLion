'use client';

import Link from 'next/link';
import { Gem, ArrowLeft } from 'lucide-react';

export default function DiamondShopPage() {
  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/commerce" className="text-accent hover:underline mb-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Commerce
        </Link>
        <div className="text-center py-16">
          <Gem className="h-16 w-16 mx-auto text-accent/60 mb-4" />
          <h1 className="text-3xl font-bold text-text mb-2">Diamond Shop (WIP)</h1>
          <p className="text-subtle mb-6">
            Premium diamond purchases—coming soon. Use diamonds for exclusive items and perks.
          </p>
          <Link href="/shop" className="text-accent hover:underline font-medium">
            Browse Items Shop (spend coins on gear)
          </Link>
        </div>
      </div>
    </div>
  );
}
