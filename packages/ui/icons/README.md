# Icon Registry

**Status:** C5 Step 11 - Final Purge Complete - Registry Locked  
**Version:** v0.42.16

## Purpose

This folder contains the unified icon registry system with lazy-loading, caching, and fallback support. Icons are loaded on-demand and cached in memory for performance.

## Current State

- ✅ Complete icon registry with 134 canonical icons (`registry.ts`)
- ✅ All icons implemented with real lucide-react imports
- ✅ Lazy-loading system with caching (`loader.ts`)
- ✅ Fallback icon component (`fallback.tsx`)
- ✅ Icon atom integrated with loader (`packages/ui/atoms/icon.tsx`)
- ✅ All UI components migrated to use Icon component
- ✅ Canonical map validated and synced
- ✅ Registry locked - no stub icons remain

## C5 Implementation Plan

### Phase 1: Icon Audit & Cataloging
- Identify all icons across codebase
- Categorize by semantic meaning
- Tag duplicates and variants
- Document current usage locations

### Phase 2: Canonical Icon Selection
- Choose canonical icon for each semantic meaning
- Select best quality/consistency icon
- Document selection rationale
- Create icon registry mapping

### Phase 3: Registry Implementation
- Build unified icon registry/component
- Implement lazy-loading strategy
- Add fallback handling
- Create icon component API

### Phase 4: Migration
- Feature-by-feature migration
- Replace old icon imports with registry
- Update icon names to canonical
- Test visual consistency

## Registry Structure (Planned)

```typescript
export const iconRegistry: Record<string, React.ComponentType<IconSvgProps>> = {
  // Action Icons
  edit: EditIcon,
  delete: DeleteIcon,
  add: AddIcon,
  remove: RemoveIcon,
  save: SaveIcon,
  cancel: CancelIcon,
  close: CloseIcon,
  check: CheckIcon,
  
  // Navigation Icons
  home: HomeIcon,
  back: BackIcon,
  forward: ForwardIcon,
  menu: MenuIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  // ... etc
};
```

## Usage

### Basic Usage

```tsx
import { Icon } from '@parel/ui';

// Simple usage
<Icon name="edit" size="md" />

// With variant
<Icon name="heart" variant="filled" size="lg" />

// With accessibility
<Icon name="close" aria-label="Close dialog" />

// With custom styling
<Icon name="home" className="text-blue-600" size={20} />
```

### Advanced Usage

```tsx
import { loadIcon, clearIconCache, getCacheStats } from '@parel/ui/icons';

// Preload an icon
const EditIcon = await loadIcon('edit');

// Check cache stats (for debugging)
const stats = getCacheStats();
console.log(`Loaded ${stats.size} icons:`, stats.keys);

// Clear cache (for testing)
clearIconCache();
```

### Lazy-Loading Behavior

- Icons are loaded **on-demand** when the `<Icon>` component renders
- Loaded icons are **cached in memory** for subsequent renders
- Cache key format: `name` or `name-variant` (if variant specified)
- Fallback icon is shown while loading or if icon is missing

### Variant Support

Icons support variants (`outline`, `filled`, `solid`), though variant resolution is not yet implemented. All icons currently use the default lucide-react style.

```tsx
<Icon name="heart" variant="outline" />  // Outline style (future)
<Icon name="heart" variant="filled" />   // Filled style (future)
<Icon name="heart" variant="solid" />    // Solid style (future)
```

### Fallback Behavior

- Missing icons automatically show a fallback placeholder
- Development mode logs warnings for missing icons
- Fallback icon shows icon name in dev mode (small text)
- Production mode silently falls back to placeholder

## Icon Naming Conventions

- **Flat namespace:** `icon-name` (e.g., `edit`, `delete`, `home`)
- **No prefixes:** avoid `icon-edit` or `action-edit`
- **Consistent naming:** kebab-case, lowercase
- **Semantic names:** `heart` not `like-icon`

## Categories (Organizational)

Icons are organized by category for management, but the API uses flat names:

- **Action Icons (15):** edit, delete, add, remove, save, cancel, confirm, close, check, plus, minus, sword, hammer, shield, swords
- **Navigation Icons (13):** home, back, forward, menu, hamburger, chevron-*, arrow-*
- **Status Icons (12):** success, warning, error, info, loading, spinner, check-circle, alert-circle, x-circle, info-circle, zap, lightbulb
- **Media Icons (16):** image, video, audio, play, pause, stop, volume, mute, fullscreen, camera, microphone, film, gamepad, palette, file, skip
- **Social Icons (12):** like, heart, comment, share, follow, unfollow, message, reply, retweet, bookmark, laugh, repeat
- **Gamification Icons (16):** xp, streak, trophy, medal, star, level-up, achievement, badge, crown, flame, gift, coin, gem, dice, moon, coins
- **User & Profile Icons (14):** user, avatar, profile, settings, account, logout, login, team, group, person, brain, mask, lock, bot
- **Challenge & Activity Icons (10):** challenge, task, checklist, complete, incomplete, progress, timer, clock, calendar, event
- **Discovery & World Icons (14):** discovery, explore, map, location, world, globe, compass, treasure, lore, book, package, box, flask, shopping
- **System & Utility Icons (13):** search, filter, sort, refresh, download, upload, copy, link, external-link, more, ellipsis, arrow-up-down

**Total: 134 icons** - All implemented with real lucide-react imports

## See Also

- **Architecture Doc:** `/docs/architecture/C5-icon-diet.md`
- **Icon Component:** `packages/ui/atoms/icon.tsx`
- **UI Atoms:** `packages/ui/atoms/`

