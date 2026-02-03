/**
 * Icon Loader
 * v0.42.12 - C5 Step 7: Edge Cases, Cleanup & Deprecation
 *
 * Handles lazy-loading, caching, and fallback logic for icons.
 *
 * Fallback Enforcement:
 * - All missing icons automatically use FallbackIcon
 * - All stubbed icons (returning null) use FallbackIcon
 * - All load errors use FallbackIcon
 * - Fallback is cached to avoid repeated lookups
 * - Development warnings logged once per missing icon
 */
import type { ComponentType } from 'react';
import type { IconSvgProps } from './registry';
export type IconVariant = 'outline' | 'filled' | 'solid';
/**
 * Load an icon from the registry
 *
 * @param name - Canonical icon name (e.g., 'edit', 'close', 'home')
 * @param variant - Optional variant ('outline', 'filled', 'solid')
 * @returns Promise resolving to icon component or FallbackIcon
 */
export declare function loadIcon(name: string, variant?: IconVariant): Promise<ComponentType<IconSvgProps>>;
/**
 * Check if an icon exists in the registry
 *
 * @param name - Canonical icon name
 * @returns True if icon exists in registry
 */
export declare function hasIcon(name: string): boolean;
/**
 * Clear the icon cache
 * Useful for testing or forcing reloads
 */
export declare function clearIconCache(): void;
/**
 * Get cache statistics (for debugging)
 */
export declare function getCacheStats(): {
    size: number;
    keys: string[];
};
