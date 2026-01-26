# Icon Inventory

**Status:** C5 Step 1 - Foundation  
**Last Updated:** v0.42.6  
**Total Canonical Icons:** 106

## Purpose

This document tracks all icons found in the codebase and maps them to canonical icon names. This inventory will be used during C5 migration to replace emoji icons and scattered icon imports with the unified icon registry.

---

## Found Icons (Emoji Usage)

### Notification Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 🏆 | achievement notifications | packages/core/hooks/useNotificationToasts.ts | chievement | ✅ Mapped |
| ⚔️ | fight notifications | packages/core/hooks/useNotificationToasts.ts | sword (future) | ⚠️ Needs icon |
| 📘 | quest notifications | packages/core/hooks/useNotificationToasts.ts | ook | ✅ Mapped |
| ⭐ | levelup notifications | packages/core/hooks/useNotificationToasts.ts | level-up | ✅ Mapped |
| 🎁 | loot notifications | packages/core/hooks/useNotificationToasts.ts | gift (future) | ⚠️ Needs icon |
| 🛠️ | system notifications | packages/core/hooks/useNotificationToasts.ts | settings | ✅ Mapped |
| 💬 | social notifications | packages/core/hooks/useNotificationToasts.ts | message | ✅ Mapped |

### Stat XP Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 💤 | sleep stat | packages/core/hooks/useStatXpPopup.ts | moon (future) | ⚠️ Needs icon |
| 💪 | health stat | packages/core/hooks/useStatXpPopup.ts | heart | ✅ Mapped |
| 💬 | social stat | packages/core/hooks/useStatXpPopup.ts | message | ✅ Mapped |
| 📘 | knowledge stat | packages/core/hooks/useStatXpPopup.ts | ook | ✅ Mapped |
| 🎨 | creativity stat | packages/core/hooks/useStatXpPopup.ts | palette (future) | ⚠️ Needs icon |

### Toast Theme Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 💫 | xp toast | packages/core/config/toastTheme.ts | xp | ✅ Mapped |
| 🪙 | gold toast | packages/core/config/toastTheme.ts | coin (future) | ⚠️ Needs icon |
| 🎁 | item toast | packages/core/config/toastTheme.ts | gift (future) | ⚠️ Needs icon |
| 👑 | boss toast | packages/core/config/toastTheme.ts | crown | ✅ Mapped |
| 💥 | crit toast | packages/core/config/toastTheme.ts | zap (future) | ⚠️ Needs icon |
| ⚒️ | craft toast | packages/core/config/toastTheme.ts | hammer (future) | ⚠️ Needs icon |
| 💰 | shop toast | packages/core/config/toastTheme.ts | coin (future) | ⚠️ Needs icon |
| 🏅 | achievement toast | packages/core/config/toastTheme.ts | chievement | ✅ Mapped |
| 🔥 | rest toast | packages/core/config/toastTheme.ts | lame | ✅ Mapped |
| 💬 | info toast | packages/core/config/toastTheme.ts | message | ✅ Mapped |
| ⛔ | error toast | packages/core/config/toastTheme.ts | error | ✅ Mapped |

### Currency Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 💰 | funds currency | packages/core/config/constants.ts | coin (future) | ⚠️ Needs icon |
| 💎 | diamonds currency | packages/core/config/constants.ts | gem (future) | ⚠️ Needs icon |

### Archetype Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 🗡️ | warrior archetype | packages/core/config/archetypeConfig.ts | sword (future) | ⚠️ Needs icon |
| 🧠 | thinker archetype | packages/core/config/archetypeConfig.ts | rain (future) | ⚠️ Needs icon |
| 🎭 | trickster archetype | packages/core/config/archetypeConfig.ts | mask (future) | ⚠️ Needs icon |
| 💬 | charmer archetype | packages/core/config/archetypeConfig.ts | message | ✅ Mapped |

### Onboarding Category Icons

| Emoji | Current Usage | File Path | Canonical Name | Status |
|-------|--------------|-----------|----------------|--------|
| 🎨 | art category | packages/types/src/onboarding.ts | palette (future) | ⚠️ Needs icon |
| 🎮 | games category | packages/types/src/onboarding.ts | gamepad (future) | ⚠️ Needs icon |
| 💬 | psychology category | packages/types/src/onboarding.ts | message | ✅ Mapped |
| 🎧 | music category | packages/types/src/onboarding.ts | music | ✅ Mapped |
| 🎬 | movies category | packages/types/src/onboarding.ts | ilm (future) | ⚠️ Needs icon |
| 🎲 | random category | packages/types/src/onboarding.ts | dice (future) | ⚠️ Needs icon |
| 🔥 | roast category | packages/types/src/onboarding.ts | lame | ✅ Mapped |

---

## Icon Library Status

### Installed Libraries

- ✅ lucide-react@0.294.0 - Installed but not yet imported in allowed directories
- ⚠️ No SVG icon files found in allowed directories
- ⚠️ No icon component imports found (may be in filtered directories)

### Future Icon Sources

- lucide-react - Primary icon library (already installed)
- Custom SVG icons - May exist in filtered directories
- Emoji replacements - Will be replaced with SVG icons in C5 Step 2+

---

## Canonical Icon Registry

### Total Icons: 106

**By Category:**
- Action Icons: 11
- Navigation Icons: 13
- Status Icons: 10
- Media Icons: 11
- Social Icons: 10
- Gamification Icons: 10
- User & Profile Icons: 10
- Challenge & Activity Icons: 10
- Discovery & World Icons: 10
- System & Utility Icons: 11

See packages/ui/icons/registry.ts for complete canonical list.

---

## Migration Notes

### Emoji Icons Found: 27 unique emojis

**Mapped to Canonical (11):**
- ✅ achievement → chievement
- ✅ book → ook
- ✅ level-up → level-up
- ✅ settings → settings
- ✅ message → message
- ✅ xp → xp
- ✅ crown → crown
- ✅ flame → lame
- ✅ error → error
- ✅ music → music

**Need New Icons (16):**
- ⚠️ sword, gift, moon, palette, coin, gem, zap, hammer, brain, mask, gamepad, film, dice

### Next Steps (C5 Step 2+)

1. Import icons from lucide-react for canonical names
2. Create custom icons for missing mappings (sword, gift, etc.)
3. Replace emoji strings with <Icon name=\"...\" /> components
4. Update all files listed in this inventory

---

## File Locations Summary

**Notification Icons:**
- packages/core/hooks/useNotificationToasts.ts

**Stat XP Icons:**
- packages/core/hooks/useStatXpPopup.ts

**Toast Theme Icons:**
- packages/core/config/toastTheme.ts

**Currency Icons:**
- packages/core/config/constants.ts

**Archetype Icons:**
- packages/core/config/archetypeConfig.ts

**Onboarding Icons:**
- packages/types/src/onboarding.ts

---

**Last Updated:** v0.42.6 - C5 Step 1



## Migration Status (C5 Step 3+)

### Batch #1 - Core Icons (v0.42.8) ✅

| Icon Name | Status | Source | Notes |
|-----------|--------|--------|-------|
| close | ✅ Migrated | lucide-react (X) | Real icon loaded |
| check | ✅ Migrated | lucide-react (Check) | Real icon loaded |
| chevron-left | ✅ Migrated | lucide-react (ChevronLeft) | Real icon loaded |
| chevron-right | ✅ Migrated | lucide-react (ChevronRight) | Real icon loaded |
| menu | ✅ Migrated | lucide-react (Menu) | Real icon loaded |
| search | ✅ Migrated | lucide-react (Search) | Real icon loaded |
| user | ✅ Migrated | lucide-react (User) | Real icon loaded |
| warning | ✅ Migrated | lucide-react (AlertTriangle) | Real icon loaded |
| success | ✅ Migrated | lucide-react (CheckCircle) | Real icon loaded |
| error | ✅ Migrated | lucide-react (XCircle) | Real icon loaded |

**Total Migrated:** 10 / 106 icons

---




## UI Migration Status (C5 Step 4+)

### Batch #1 - Pilot UI Components (v0.42.9) ✅

| Component | Status | Icon Used | Notes |
|-----------|--------|-----------|-------|
| packages/ui/atoms/modal.tsx | ✅ Migrated | close | Replaced inline SVG with <Icon name="close" /> |

**Skipped (Requires Refactoring):**
- packages/core/config/toastTheme.ts - Icon used as string in template literals, would require toast system refactor
- packages/core/hooks/useNotificationToasts.ts - No error type in TYPE_ICONS, other icons not yet migrated

**Total Migrated:** 1 / 3 components (pilot batch)

---

