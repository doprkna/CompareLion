# C5 â€” Icon Diet (One Icon Registry)

## Purpose

This document defines the plan for consolidating icons into one icon registry. It provides an icon inventory, registry design, duplicate removal strategy, usage patterns, migration strategy, and risk map for structural planning.

---

# C5 â€” Icon Diet (One Icon Registry) â€” Planning Document

## 1. Icon Inventory

### Action Icons
- edit, delete, add, remove, save, cancel, confirm, close, check, plus, minus

### Navigation Icons
- home, back, forward, menu, hamburger, chevron-left, chevron-right, chevron-up, chevron-down, arrow-left, arrow-right, arrow-up, arrow-down

### Status Icons
- success, warning, error, info, loading, spinner, check-circle, alert-circle, x-circle, info-circle

### Media Icons
- image, video, audio, play, pause, stop, volume, mute, fullscreen, camera, microphone

### Social Icons
- like, heart, comment, share, follow, unfollow, message, reply, retweet, bookmark

### Gamification Icons
- xp, streak, trophy, medal, star, level-up, achievement, badge, crown, flame

### User & Profile Icons
- user, avatar, profile, settings, account, logout, login, team, group, person

### Challenge & Activity Icons
- challenge, task, checklist, complete, incomplete, progress, timer, clock, calendar, event

### Discovery & World Icons
- discovery, explore, map, location, world, globe, compass, treasure, lore, book

### System & Utility Icons
- search, filter, sort, refresh, download, upload, copy, link, external-link, more, ellipsis

---

## 2. Registry Design

### Namespacing Rules

- **Flat namespace:** `icon-name` (e.g., `edit`, `delete`, `home`)
- **No prefixes:** avoid `icon-edit` or `action-edit`
- **Consistent naming:** kebab-case, lowercase
- **Semantic names:** `heart` not `like-icon`
- **Grouped conceptually:** categories are organizational, not part of the name

### Mapping Rules

- **One icon per name:** each name maps to a single icon asset
- **Variant support:** same icon with different styles (outline, filled, solid) via variant prop
- **Size variants:** handled via size prop, not separate names
- **Color inheritance:** icons inherit color from parent by default, with override option
- **No aliases:** avoid multiple names for the same icon

### Lazy-Loading Strategy

- **Load on demand:** icons loaded when component renders
- **Bundle splitting:** icons split into separate chunks by category
- **Preload critical:** critical icons (home, menu, close) preloaded
- **Tree-shaking:** unused icons excluded from bundle
- **Icon font alternative:** consider icon font for frequently used icons

### Fallback Icons

- **Default fallback:** generic placeholder icon for missing icons
- **Error handling:** graceful degradation when icon fails to load
- **Development mode:** show icon name in fallback for debugging
- **Production mode:** silent fallback to placeholder
- **Missing icon tracking:** log missing icons in development

---

## 3. Duplicate Removal Strategy

### Icon Consolidation Rules

**Keep (Canonical):**
- Single canonical icon per semantic meaning
- Most commonly used variant/style
- Highest quality/consistency icon
- Most accessible icon (clear at small sizes)

**Deprecate:**
- Duplicate icons with same semantic meaning
- Feature-specific icon variants that duplicate canonical
- Low-quality or inconsistent icons
- Icons with accessibility issues

**Merge:**
- Similar icons with slight style differences â†’ unified with variant prop
- Multiple sizes of same icon â†’ single icon with size prop
- Colored versions â†’ single icon with color inheritance/override

### Common Duplicate Patterns

**Action Icons:**
- Multiple edit icons (pencil, edit-pen, modify) â†’ `edit`
- Multiple delete icons (trash, remove, delete) â†’ `delete`
- Multiple add icons (plus, add-circle, create) â†’ `add`

**Navigation Icons:**
- Multiple menu icons (hamburger, menu-bars, nav) â†’ `menu`
- Multiple back icons (arrow-back, chevron-back, left) â†’ `back`
- Multiple home icons (house, home-circle, dashboard) â†’ `home`

**Status Icons:**
- Multiple success icons (check, checkmark, success-circle) â†’ `success`
- Multiple error icons (x, error-circle, alert) â†’ `error`
- Multiple warning icons (warning-triangle, alert, caution) â†’ `warning`

**Social Icons:**
- Multiple like icons (heart, like, thumbs-up) â†’ `like` (or `heart` if heart is primary)
- Multiple share icons (share, share-arrow, export) â†’ `share`
- Multiple comment icons (comment, chat, message-bubble) â†’ `comment`

---

## 4. Icon Usage Patterns

### Component Integration

- **Icon component:** single `<Icon>` component accepts `name` prop
- **Size prop:** `sm`, `md`, `lg`, `xl` (or numeric sizes)
- **Variant prop:** `outline`, `filled`, `solid` (if multiple styles exist)
- **Color prop:** optional override, otherwise inherits from parent
- **Accessibility:** always include `aria-label` or `aria-hidden` appropriately

### Composition Patterns

- **With text:** icon + text side-by-side (spacing handled by parent)
- **Button icons:** icon inside button (size matches button size)
- **Badge icons:** icon inside badge (smaller size)
- **Standalone:** icon as visual element (decorative, aria-hidden)

### Performance Patterns

- **Critical icons:** preload in initial bundle
- **Common icons:** lazy-load on first use, then cache
- **Rare icons:** lazy-load on demand
- **Icon fonts:** consider for icon-heavy pages (20+ icons)

---

## 5. Migration Strategy

### Step 1: Icon Audit & Cataloging
- Identify all icons across codebase
- Categorize by semantic meaning
- Tag duplicates and variants
- Document current usage locations
- Can run in parallel: Yes (multiple auditors)

### Step 2: Canonical Icon Selection
- Choose canonical icon for each semantic meaning
- Select best quality/consistency icon
- Document selection rationale
- Create icon registry mapping
- Can run in parallel: No (requires Step 1)

### Step 3: Registry Implementation
- Build unified icon registry/component
- Implement lazy-loading strategy
- Add fallback handling
- Create icon component API
- Can run in parallel: No (blocks Step 4)

### Step 4: Visual Regression Baseline
- Capture current icon rendering
- Set up visual regression testing
- Document expected differences
- Can run in parallel: After Step 3

### Step 5: Feature-by-Feature Migration
- Migrate one feature/module at a time
- Replace old icon imports with registry
- Update icon names to canonical
- Test visual consistency
- Can run in parallel: Yes (different features)

### Step 6: Deprecation & Cleanup
- Mark old icon imports as deprecated
- Remove unused icon assets
- Update documentation
- Clean up icon-related code
- Can run in parallel: After Step 5 (gradual)

**Execution Order:**
- Steps 1-2: Serial (audit â†’ selection)
- Step 3: After Step 2
- Step 4: After Step 3
- Steps 5-6: Parallel migration, then gradual cleanup

---

## 6. Risk Map

### Visual Inconsistency

**Risk:** New canonical icons may look different from old icons, causing visual breaks

**Mitigation:**
- Visual regression testing to catch differences
- Gradual migration allows fixing issues incrementally
- Document visual changes in migration guide
- Provide side-by-side comparison during migration

### Missing Icons

**Risk:** Some icons may not have canonical equivalents, breaking UI

**Mitigation:**
- Comprehensive audit to identify all icons
- Create missing icons or find suitable replacements
- Fallback icon system for graceful degradation
- Missing icon tracking in development mode

### Performance Regression

**Risk:** Lazy-loading or registry overhead may slow down icon rendering

**Mitigation:**
- Profile icon loading performance
- Preload critical icons
- Use icon fonts for icon-heavy pages
- Monitor bundle size changes
- Implement efficient caching strategy

### Bundle Size Increase

**Risk:** Including all icons in bundle may increase size significantly

**Mitigation:**
- Lazy-loading strategy to load icons on demand
- Tree-shaking to exclude unused icons
- Code-split icon registry
- Consider icon fonts for common icons
- Monitor bundle size with budgets

### Accessibility Issues

**Risk:** New icons may not have proper accessibility attributes

**Mitigation:**
- Ensure all icons have proper `aria-label` or `aria-hidden`
- Test with screen readers
- Document accessibility requirements
- Include accessibility in visual regression tests

### Developer Adoption

**Risk:** Developers may continue using old icon imports

**Mitigation:**
- Clear migration guide with examples
- Deprecation warnings on old imports
- Code review enforcement
- Training sessions on new icon system

### Icon Name Conflicts

**Risk:** Different features may use same icon name for different icons

**Mitigation:**
- Comprehensive naming audit before migration
- Semantic naming conventions
- Document icon name decisions
- Resolve conflicts before registry implementation

---

## 7. Icon Registry Architecture (Conceptual)

### Registry Structure

- **Central registry:** single source of truth for all icons
- **Icon mapping:** name â†’ asset path/component mapping
- **Category organization:** icons organized by category (for management, not API)
- **Variant support:** registry handles variant selection (outline/filled)
- **Size handling:** registry provides size-appropriate assets

### Loading Strategy

- **On-demand loading:** icons loaded when `<Icon name="..." />` renders
- **Caching:** loaded icons cached to avoid re-fetching
- **Preloading:** critical icons preloaded in initial bundle
- **Lazy chunks:** icons split into chunks by category or usage frequency

### Component API

- **Simple API:** `<Icon name="edit" size="md" />`
- **Variant support:** `<Icon name="heart" variant="filled" />`
- **Color override:** `<Icon name="star" color="gold" />`
- **Accessibility:** `<Icon name="close" aria-label="Close" />`

---

## Summary

This plan establishes:
- Icon inventory organized by semantic categories
- Registry design with namespacing, mapping, and loading strategies
- Duplicate removal strategy (keep/deprecate/merge)
- Icon usage patterns for consistent integration
- Migration strategy with parallelization opportunities
- Risk map with mitigation strategies
- Registry architecture principles

Ready for review before implementation begins.
