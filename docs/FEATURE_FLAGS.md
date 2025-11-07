# Feature Flags System

**Version:** 0.34.9  
**Purpose:** Centralized feature toggle management for PAREL

---

## ðŸ“‹ Overview

The Feature Flags system provides a single source of truth for all feature toggles in PAREL. Instead of scattered `process.env` checks throughout the codebase, all flags are managed through a typed configuration file.

**Key Benefits:**
- âœ… Type-safe flag access
- âœ… Centralized configuration
- âœ… Easy to test and override
- âœ… Clear visibility of all toggles
- âœ… Admin UI for runtime control (dev only)

---

## ðŸ—ï¸ Architecture

### Core File: `apps/web/lib/config/flags.ts`

This file exports:
- **`getFlags()`** - Returns all current flag values
- **`FeatureFlags`** - TypeScript type for all flags
- **`getFlag(key)`** - Get a specific flag value
- **`isDevelopment()`** - Check if in dev mode
- **`isProduction()`** - Check if in prod mode

### Current Flags

| Flag Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `enableBase` | `boolean` | `true` | Core base/camp system functionality |
| `enableTrials` | `boolean` | `true` | Mount trials and micro-challenges |
| `enableThemes` | `boolean` | `true` | User profile themes and customization |
| `enableEconomyV2` | `boolean` | `false` | Next-generation economy system (experimental) |
| `enableAnalytics` | `boolean` | env-based | Analytics and metrics tracking |
| `environment` | `string` | `development` | Current runtime environment |

---

## ðŸ”§ Usage

### Basic Usage

```typescript
import { getFlags } from '@/lib/config/flags';

const flags = getFlags();

if (flags.enableThemes) {
  // Render theme customization UI
}

if (flags.enableEconomyV2) {
  // Use new economy system
} else {
  // Use legacy economy
}
```

### Getting a Single Flag

```typescript
import { getFlag } from '@/lib/config/flags';

const themesEnabled = getFlag('enableThemes');
```

### Environment Checks

```typescript
import { isDevelopment, isProduction } from '@/lib/config/flags';

if (isDevelopment()) {
  console.log('Dev mode: showing debug info');
}

if (isProduction()) {
  // Enable production optimizations
}
```

### Client Components

Feature flags work in both server and client components:

```typescript
'use client';

import { getFlags } from '@/lib/config/flags';

export function MyClientComponent() {
  const flags = getFlags();
  
  return (
    <div>
      {flags.enableThemes && <ThemeSelector />}
    </div>
  );
}
```

---

## ðŸŽ›ï¸ Admin Control

### Admin UI: `/admin/flags`

The admin panel provides a visual interface for managing flags:
- **Toggle switches** for boolean flags
- **Badge display** for non-boolean values
- **Development-only editing** (read-only in production)
- **localStorage persistence** for local overrides
- **Reset to defaults** button

### Dev-Lab Integration

The `/admin/dev-lab` page shows a summary card of all current flag values for quick reference during development.

---

## ðŸ“ Naming Convention

**ALWAYS follow these rules:**

âœ… **Good Names:**
- `enableX` - Feature is on/off
- `useNewX` - New version of a feature
- `showX` - UI element visibility

âŒ **Bad Names:**
- `isXActive` - Too verbose
- `xEnabled` - Inconsistent ordering
- `featureX` - Not descriptive enough

**Format:** `enable[Feature]` or `use[Feature]`

---

## ðŸ”„ Adding New Flags

### 1. Update `flags.ts`

```typescript
export const getFlags = () => ({
  // Existing flags...
  enableNewFeature: false, // Add new flag
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
});
```

### 2. Update Admin UI (Optional)

Edit `/admin/flags/page.tsx` to add description and category:

```typescript
const flagDescriptions: Record<keyof FeatureFlags, string> = {
  // ...
  enableNewFeature: 'Description of the new feature',
};

const flagCategories: Record<string, (keyof FeatureFlags)[]> = {
  'Core Features': ['enableBase', 'enableTrials', 'enableNewFeature'],
  // ...
};
```

### 3. Use in Code

```typescript
import { getFlags } from '@/lib/config/flags';

const flags = getFlags();
if (flags.enableNewFeature) {
  // New feature code
}
```

---

## ðŸ§ª Testing with Flags

### Override Flags in Development

In development mode, visit `/admin/flags` and toggle any flag. The override is saved to `localStorage` and persists across page reloads.

### Reset Flags

Click **"Reset to Defaults"** in `/admin/flags` to clear all overrides.

### Programmatic Override (Tests)

```typescript
// In test setup
if (typeof window !== 'undefined') {
  localStorage.setItem('featureFlagOverrides', JSON.stringify({
    enableNewFeature: true,
  }));
}
```

---

## ðŸš€ Production Behavior

- **Flags are read-only** in production
- **No localStorage overrides** applied
- **Environment-based flags** still respect env vars (e.g., `enableAnalytics`)
- **Admin UI is read-only** (shows current values but cannot edit)

---

## ðŸ” Visibility

### Where Flags Are Used

Run this search to find all flag usage:

```bash
git grep "getFlags()" apps/web
```

### Current Integration Points

- `apps/web/lib/metrics.ts` - Analytics toggle
- `apps/web/app/api/metrics/route.ts` - Metrics API
- `apps/web/app/admin/perf/page.tsx` - Dev tools visibility
- `apps/web/app/api/health/extended/route.ts` - Health check features

---

## âš ï¸ Important Notes

1. **Never nest flags** - Keep the flags object flat
2. **Avoid dynamic env reads** - Only read `process.env` inside `getFlags()`
3. **No database writes yet** - Admin UI uses localStorage only
4. **Document new flags** - Update this file when adding flags

---

## ðŸ“š Related Files

- **Core:** `apps/web/lib/config/flags.ts`
- **Admin UI:** `apps/web/app/admin/flags/page.tsx`
- **Dev Lab:** `apps/web/app/admin/dev-lab/page.tsx`
- **Integration:** Various files using `getFlags()`

---

**Last Updated:** 2025-11-06  
**Version:** 0.34.9
