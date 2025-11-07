/**
 * Lazy-Loaded Components
 * Performance optimization: Load heavy components only when needed
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

/**
 * Lazy-loaded Shop Component
 * Defers loading of shop-related code until user navigates to shop
 */
export const LazyShop = dynamic(
  () => import('@/components/shop/ShopView').then(mod => mod.ShopView || mod.default),
  {
    loading: LoadingFallback,
    ssr: false, // Shop requires client-side interaction
  }
);

/**
 * Lazy-loaded FlowRunner Component  
 * Defers loading of flow/question engine until user starts a flow
 */
export const LazyFlowRunner = dynamic(
  () => import('@/components/flow/FlowRunner').then(mod => mod.FlowRunner || mod.default),
  {
    loading: LoadingFallback,
    ssr: false, // FlowRunner is interactive
  }
);

/**
 * Lazy-loaded Character Creator
 * Heavy component with many customization options
 */
export const LazyCharacterCreator = dynamic(
  () => import('@/components/character/CharacterCreator').catch(() => ({ default: () => null })),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

/**
 * Lazy-loaded Leaderboard
 * Data-heavy component with charts and tables
 */
export const LazyLeaderboard = dynamic(
  () => import('@/components/leaderboard/Leaderboard').catch(() => ({ default: () => null })),
  {
    loading: LoadingFallback,
    ssr: true, // Can be pre-rendered for initial load
  }
);

/**
 * Helper: Create custom lazy component with loading state
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: {
    ssr?: boolean;
    fallback?: ComponentType;
  }
) {
  return dynamic(
    () => importFn().then(mod => ('default' in mod ? mod.default : mod)),
    {
      loading: options?.fallback || LoadingFallback,
      ssr: options?.ssr ?? false,
    }
  );
}

// Re-export for convenience
export { LoadingFallback };
