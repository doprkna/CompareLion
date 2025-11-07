'use client';

/**
 * Market Page (Disabled for Public Beta v0.13.2p)
 */

import { FeatureGuard } from '@/components/FeatureGuard';

export default function MarketPage() {
  return <FeatureGuard feature="ECONOMY" redirectTo="/main" />;
}
