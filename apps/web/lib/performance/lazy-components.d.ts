/**
 * Lazy-Loaded Components
 * Performance optimization: Load heavy components only when needed
 */
import { ComponentType } from 'react';
declare const LoadingFallback: () => import("react").JSX.Element;
/**
 * Lazy-loaded Shop Component
 * Defers loading of shop-related code until user navigates to shop
 */
export declare const LazyShop: ComponentType<{}>;
/**
 * Lazy-loaded FlowRunner Component
 * Defers loading of flow/question engine until user starts a flow
 */
export declare const LazyFlowRunner: ComponentType<{}>;
/**
 * Lazy-loaded Character Creator
 * Heavy component with many customization options
 */
export declare const LazyCharacterCreator: ComponentType<{}>;
/**
 * Lazy-loaded Leaderboard
 * Data-heavy component with charts and tables
 */
export declare const LazyLeaderboard: ComponentType<{}>;
/**
 * Helper: Create custom lazy component with loading state
 */
export declare function createLazyComponent<P = {}>(importFn: () => Promise<{
    default: ComponentType<P>;
} | ComponentType<P>>, options?: {
    ssr?: boolean;
    fallback?: ComponentType;
}): ComponentType<P>;
export { LoadingFallback };
