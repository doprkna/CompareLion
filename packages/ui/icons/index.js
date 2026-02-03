/**
 * Icon Registry - Barrel Export
 * v0.42.7 - C5 Step 2: Icon Registry Engine
 *
 * This module exports the icon registry, loader, and related utilities.
 */
export { ICONS, hasIcon, getAllIconNames, getIconsByCategory } from './registry';
export { loadIcon, clearIconCache, getCacheStats } from './loader';
export { FallbackIcon } from './fallback';
export { EMOJI_TO_CANONICAL, IMPORT_PATH_TO_CANONICAL, COMPONENT_NAME_TO_CANONICAL, getCanonicalFromEmoji, getCanonicalFromImportPath, getCanonicalFromComponentName, hasEmojiMapping, getAllEmojiMappings, getMissingIcons } from './canonical-map';
// TODO: C5 Step 2+ - Export icon types when implemented
// export type { IconVariant } from './types';
// TODO: C5 Step 2+ - Export icon categories for organization
// export { actionIcons, navigationIcons, statusIcons } from './categories';
