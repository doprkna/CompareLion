/**
 * Canonical Icon Mapping
 * v0.42.12 - C5 Step 7: Edge Cases, Cleanup & Deprecation
 *
 * Maps existing icon usage (emoji strings, old import paths) to canonical icon names.
 * This mapping is used during C5 migration to replace old icon references.
 *
 * Structure:
 * - Emoji strings → canonical icon names
 * - Old import paths → canonical icon names (DEPRECATED - use <Icon /> instead)
 * - Component names → canonical icon names
 *
 * Validation:
 * - All canonical names should exist in registry (see registry.ts)
 * - Missing icons are marked with "TODO: Missing in registry"
 * - Icons that exist but are stubbed are marked with "TODO: Stub - needs implementation"
 */
/**
 * Map emoji strings to canonical icon names
 * Used during migration to replace emoji icons with SVG icons
 */
export declare const EMOJI_TO_CANONICAL: Record<string, string>;
/**
 * Map old icon import paths to canonical icon names
 *
 * @deprecated Use <Icon name="canonicalName" /> instead
 * This mapping is for migration reference only. All old icon imports should be replaced
 * with the unified Icon component from '@parel/ui/atoms'.
 *
 * Updated in C5 Step 3 - Batch #1
 * Deprecated in C5 Step 7 - v0.42.12
 */
export declare const IMPORT_PATH_TO_CANONICAL: Record<string, string>;
/**
 * Map component names to canonical icon names
 * TODO: Populate when icon components are found
 */
export declare const COMPONENT_NAME_TO_CANONICAL: Record<string, string>;
/**
 * Get canonical icon name from emoji string
 */
export declare function getCanonicalFromEmoji(emoji: string): string | null;
/**
 * Get canonical icon name from import path
 */
export declare function getCanonicalFromImportPath(path: string): string | null;
/**
 * Get canonical icon name from component name
 */
export declare function getCanonicalFromComponentName(name: string): string | null;
/**
 * Check if emoji has a canonical mapping
 */
export declare function hasEmojiMapping(emoji: string): boolean;
/**
 * Get all emoji mappings
 */
export declare function getAllEmojiMappings(): Record<string, string>;
/**
 * Get all canonical names that need new icons
 * (icons that don't exist in the base registry yet)
 *
 * @deprecated All icons are now in registry (v0.42.13)
 * @returns Empty array - all icons are now implemented
 */
export declare function getMissingIcons(): string[];
/**
 * Validate canonical names against registry
 * Checks if all canonical names in EMOJI_TO_CANONICAL exist in the registry
 *
 * @param registryIconNames - Set of icon names from registry (from getAllIconNames())
 * @returns Object with missing and stubbed icon information
 */
export declare function validateCanonicalMap(registryIconNames: Set<string>): {
    missing: string[];
    stubbed: string[];
    valid: string[];
};
