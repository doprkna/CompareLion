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
import { FallbackIcon } from './fallback';
import { ICONS } from './registry';

export type IconVariant = 'outline' | 'filled' | 'solid';

// In-memory cache for loaded icons
// Key format: "name" or "name-variant"
const iconCache = new Map<string, ComponentType<IconSvgProps>>();

// Track missing icons to avoid spam warnings
const missingIconWarnings = new Set<string>();

/**
 * Load an icon from the registry
 * 
 * @param name - Canonical icon name (e.g., 'edit', 'close', 'home')
 * @param variant - Optional variant ('outline', 'filled', 'solid')
 * @returns Promise resolving to icon component or FallbackIcon
 */
export async function loadIcon(
  name: string,
  variant?: IconVariant
): Promise<ComponentType<IconSvgProps>> {
  // Create cache key
  const cacheKey = variant ? `${name}-${variant}` : name;

  // Check cache first
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  // Fallback Enforcement: Check if icon exists in registry
  // If icon doesn't exist, immediately return FallbackIcon
  if (!ICONS[name]) {
    if (process.env.NODE_ENV === 'development') {
      const warningKey = `${name}${variant ? `-${variant}` : ''}`;
      if (!missingIconWarnings.has(warningKey)) {
        console.warn(
          `[Icon] Icon not found in registry: "${name}"${variant ? ` (variant: ${variant})` : ''}. Using fallback.`
        );
        missingIconWarnings.add(warningKey);
      }
    }
    // Cache fallback to avoid repeated lookups
    iconCache.set(cacheKey, FallbackIcon);
    return FallbackIcon;
  }

  // Load icon via lazy-loader function
  try {
    const loader = ICONS[name];
    const IconComponent = await loader();

    // Fallback Enforcement: If loader returns null (stub), use fallback
    // This ensures all stubbed icons show fallback instead of breaking
    if (!IconComponent) {
      if (process.env.NODE_ENV === 'development') {
        const warningKey = `${name}${variant ? `-${variant}` : ''}`;
        if (!missingIconWarnings.has(warningKey)) {
          console.warn(
            `[Icon] Icon "${name}" is not yet implemented (stub). Using fallback.`
          );
          missingIconWarnings.add(warningKey);
        }
      }
      iconCache.set(cacheKey, FallbackIcon);
      return FallbackIcon;
    }

    // TODO: Handle variant selection when variants are implemented
    // For now, variant is ignored and we use the default icon
    // In C5 Step 3+, we'll implement variant resolution:
    // - Check if IconComponent supports variants
    // - Select appropriate variant or use default

    // Cache and return
    iconCache.set(cacheKey, IconComponent);
    return IconComponent;
  } catch (error) {
    // Fallback Enforcement: On any load error, use fallback
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Icon] Failed to load icon "${name}":`, error);
    }
    // Cache fallback on error to avoid repeated failed attempts
    iconCache.set(cacheKey, FallbackIcon);
    return FallbackIcon;
  }
}

/**
 * Check if an icon exists in the registry
 * 
 * @param name - Canonical icon name
 * @returns True if icon exists in registry
 */
export function hasIcon(name: string): boolean {
  return name in ICONS;
}

/**
 * Clear the icon cache
 * Useful for testing or forcing reloads
 */
export function clearIconCache(): void {
  iconCache.clear();
  missingIconWarnings.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: iconCache.size,
    keys: Array.from(iconCache.keys()),
  };
}

