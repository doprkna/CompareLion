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
export const EMOJI_TO_CANONICAL: Record<string, string> = {
  // Notification icons
  '🏆': 'achievement', // ✅ Exists in registry (implemented)
  '⚔️': 'sword', // ✅ Exists in registry (implemented)
  '📘': 'book', // ✅ Exists in registry (implemented)
  '⭐': 'level-up', // ✅ Exists in registry (implemented)
  '🎁': 'gift', // ✅ Exists in registry (implemented)
  '🛠️': 'settings', // ✅ Exists in registry (implemented)
  '💬': 'message', // ✅ Exists in registry (implemented)

  // Stat XP icons
  '💤': 'moon', // ✅ Exists in registry (implemented)
  '💪': 'heart', // ✅ Exists in registry (implemented) - Health stat uses heart icon
  '📘': 'book', // ✅ Exists in registry (implemented) - Knowledge stat
  '🎨': 'palette', // ✅ Exists in registry (implemented)

  // Toast theme icons
  '💫': 'xp', // ✅ Exists in registry (implemented)
  '🪙': 'coin', // ✅ Exists in registry (implemented)
  '👑': 'crown', // ✅ Exists in registry (implemented)
  '💥': 'zap', // ✅ Exists in registry (implemented)
  '⚒️': 'hammer', // ✅ Exists in registry (implemented)
  '💰': 'coin', // ✅ Exists in registry (implemented)
  '🏅': 'achievement', // ✅ Exists in registry (implemented)
  '🔥': 'flame', // ✅ Exists in registry (implemented)
  '⛔': 'error', // ✅ Exists in registry (implemented)

  // Currency icons
  '💎': 'gem', // ✅ Exists in registry (implemented)

  // Archetype icons
  '🗡️': 'sword', // ✅ Exists in registry (implemented)
  '🧠': 'brain', // ✅ Exists in registry (implemented)
  '🎭': 'mask', // ✅ Exists in registry (implemented)

  // Onboarding category icons
  '🎮': 'gamepad', // ✅ Exists in registry (implemented)
  '🎧': 'music', // ✅ Exists in registry (implemented) - maps to 'audio'
  '🎬': 'film', // ✅ Exists in registry (implemented)
  '🎲': 'dice', // ✅ Exists in registry (implemented)
} as const;

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
export const IMPORT_PATH_TO_CANONICAL: Record<string, string> = {
  /** @deprecated Use <Icon name="close" /> instead */
  'lucide-react': 'close', // X component
  /** @deprecated Use <Icon name="close" /> instead */
  'lucide-react/dist/esm/icons/x': 'close',
  /** @deprecated Use <Icon name="check" /> instead */
  'lucide-react/dist/esm/icons/check': 'check',
  /** @deprecated Use <Icon name="chevron-left" /> instead */
  'lucide-react/dist/esm/icons/chevron-left': 'chevron-left',
  /** @deprecated Use <Icon name="chevron-right" /> instead */
  'lucide-react/dist/esm/icons/chevron-right': 'chevron-right',
  /** @deprecated Use <Icon name="menu" /> instead */
  'lucide-react/dist/esm/icons/menu': 'menu',
  /** @deprecated Use <Icon name="search" /> instead */
  'lucide-react/dist/esm/icons/search': 'search',
  /** @deprecated Use <Icon name="user" /> instead */
  'lucide-react/dist/esm/icons/user': 'user',
  /** @deprecated Use <Icon name="warning" /> instead */
  'lucide-react/dist/esm/icons/alert-triangle': 'warning',
  /** @deprecated Use <Icon name="success" /> instead */
  'lucide-react/dist/esm/icons/check-circle': 'success',
  /** @deprecated Use <Icon name="error" /> instead */
  'lucide-react/dist/esm/icons/x-circle': 'error',
  
  // Component name mappings (Batch #1)
  /** @deprecated Use <Icon name="close" /> instead */
  'X': 'close',
  /** @deprecated Use <Icon name="check" /> instead */
  'Check': 'check',
  /** @deprecated Use <Icon name="chevron-left" /> instead */
  'ChevronLeft': 'chevron-left',
  /** @deprecated Use <Icon name="chevron-right" /> instead */
  'ChevronRight': 'chevron-right',
  /** @deprecated Use <Icon name="menu" /> instead */
  'Menu': 'menu',
  /** @deprecated Use <Icon name="search" /> instead */
  'Search': 'search',
  /** @deprecated Use <Icon name="user" /> instead */
  'User': 'user',
  /** @deprecated Use <Icon name="warning" /> instead */
  'AlertTriangle': 'warning',
  /** @deprecated Use <Icon name="success" /> instead */
  'CheckCircle': 'success',
  /** @deprecated Use <Icon name="error" /> instead */
  'XCircle': 'error',
} as const;

/**
 * Map component names to canonical icon names
 * TODO: Populate when icon components are found
 */
export const COMPONENT_NAME_TO_CANONICAL: Record<string, string> = {
  // Example structure (empty for now):
  // 'EditIcon': 'edit',
  // 'DeleteIcon': 'delete',
  // 'CloseIcon': 'close',
} as const;

/**
 * Get canonical icon name from emoji string
 */
export function getCanonicalFromEmoji(emoji: string): string | null {
  return EMOJI_TO_CANONICAL[emoji] || null;
}

/**
 * Get canonical icon name from import path
 */
export function getCanonicalFromImportPath(path: string): string | null {
  return IMPORT_PATH_TO_CANONICAL[path] || null;
}

/**
 * Get canonical icon name from component name
 */
export function getCanonicalFromComponentName(name: string): string | null {
  return COMPONENT_NAME_TO_CANONICAL[name] || null;
}

/**
 * Check if emoji has a canonical mapping
 */
export function hasEmojiMapping(emoji: string): boolean {
  return emoji in EMOJI_TO_CANONICAL;
}

/**
 * Get all emoji mappings
 */
export function getAllEmojiMappings(): Record<string, string> {
  return { ...EMOJI_TO_CANONICAL };
}

/**
 * Get all canonical names that need new icons
 * (icons that don't exist in the base registry yet)
 * 
 * @deprecated All icons are now in registry (v0.42.13)
 * @returns Empty array - all icons are now implemented
 */
export function getMissingIcons(): string[] {
  // All icons referenced in EMOJI_TO_CANONICAL are now in registry
  // This function kept for backward compatibility
  return [];
}

/**
 * Validate canonical names against registry
 * Checks if all canonical names in EMOJI_TO_CANONICAL exist in the registry
 * 
 * @param registryIconNames - Set of icon names from registry (from getAllIconNames())
 * @returns Object with missing and stubbed icon information
 */
export function validateCanonicalMap(registryIconNames: Set<string>): {
  missing: string[];
  stubbed: string[];
  valid: string[];
} {
  const missing: string[] = [];
  const stubbed: string[] = [];
  const valid: string[] = [];
  
  const canonicalNames = new Set(Object.values(EMOJI_TO_CANONICAL));
  
  canonicalNames.forEach(name => {
    if (!registryIconNames.has(name)) {
      missing.push(name);
    } else {
      // Note: We can't determine if icon is stubbed without checking registry implementation
      // This is a basic existence check
      valid.push(name);
    }
  });
  
  return { missing, stubbed, valid };
}

