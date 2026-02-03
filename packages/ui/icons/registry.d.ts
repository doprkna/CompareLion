/**
 * Icon Registry - Canonical Icon Names
 * v0.42.13 - C5 Step 8: Final Cleanup + Legacy Removal
 *
 * This registry defines all canonical icon names organized by category.
 * All icons are lazy-loaded via dynamic imports from lucide-react.
 *
 * Registry Structure:
 * - Flat namespace: icon-name (e.g., 'edit', 'delete', 'home')
 * - No prefixes: avoid 'icon-edit' or 'action-edit'
 * - Consistent naming: kebab-case, lowercase
 * - Semantic names: 'heart' not 'like-icon'
 * - Lazy-loading: each icon is a function that returns Promise<Component>
 *
 * See C5 architecture doc: /docs/architecture/C5-icon-diet.md
 */
import { type ComponentType } from 'react';
export interface IconSvgProps {
    size?: number | string;
    className?: string;
    'aria-label'?: string;
    'aria-hidden'?: boolean;
}
export type IconLoader = () => Promise<ComponentType<IconSvgProps> | null>;
export type IconRegistry = Record<string, IconLoader>;
/**
 * Canonical Icon Registry
 *
 * All icons are organized by category for management, but accessed via flat namespace.
 * Each icon is a lazy-load function that returns Promise<Component>.
 * All icons use dynamic imports from lucide-react library.
 */
export declare const ICONS: IconRegistry;
/**
 * Check if an icon exists in the registry
 * Note: This checks registry existence, not whether icon is loaded
 */
export declare function hasIcon(name: string): boolean;
/**
 * Get all registered icon names
 */
export declare function getAllIconNames(): string[];
/**
 * Get icon names by category (for organization/debugging)
 */
export declare function getIconsByCategory(): Record<string, string[]>;
