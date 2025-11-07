'use client';

/**
 * Guilds Page (Disabled for Public Beta v0.13.2p)
 */

import { FeatureGuard } from '@/components/FeatureGuard';

export default function GuildsPage() {
  return <FeatureGuard feature="GUILDS" redirectTo="/main" />;
}
