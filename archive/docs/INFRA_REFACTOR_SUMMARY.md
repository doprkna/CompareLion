# Infrastructure Refactor Summary

**Version:** 0.30.4  
**Date:** 2025-11-01

## Overview

This refactor consolidates duplicate infrastructure utilities, unifies constants, and streamlines debug/error handling to reduce token overhead for Cursor and ensure predictable imports.

## Changes Made

### 1. Constants Consolidation

**File:** `lib/config/constants.ts` (canonical source)

**Merged from:**
- `config/economy.ts` â†’ `ECONOMY_CONSTANTS`
- `lib/config/rewardConfig.ts` â†’ `REWARD_CONSTANTS`

**New exports:**
- `ECONOMY_CONSTANTS` - Economy, season, shop, leaderboard settings
- `REWARD_CONSTANTS` - Reward values, multipliers, drop rates
- Helper functions: `xpToCoins`, `coinsToXP`, `getCoinReward`, `getPriceRange`, `getSeasonEndReward`

**Namespace structure:**
- `XP_CONSTANTS` - XP and level progression
- `CURRENCY_CONSTANTS` - Currency settings
- `ECONOMY_CONSTANTS` - Economy and season settings
- `REWARD_CONSTANTS` - Reward calculations
- `COLOR_CONSTANTS` - UI colors
- `LIMITS_CONSTANTS` - System limits
- `TIMING_CONSTANTS` - Debounce/throttle/animation timings
- `ACHIEVEMENT_CONSTANTS` - Achievement values

**Migration:**
```typescript
// Old
import { ECONOMY_CONFIG } from '@/config/economy';
import { RewardConfig } from '@/lib/config/rewardConfig';

// New
import { ECONOMY_CONSTANTS, REWARD_CONSTANTS } from '@/lib/config/constants';
```

### 2. Error Handling Unification

**File:** `lib/api/error-handler.ts`

**Added aliases:**
```typescript
export const apiSuccess = successResponse;
export const apiError = errorResponse;
```

**Usage:**
```typescript
// Old
import { successResponse, errorResponse } from '@/lib/api/error-handler';

// New (simpler)
import { apiSuccess, apiError } from '@/lib/api/error-handler';
```

### 3. Debug Utilities

**File:** `lib/utils/debug.ts`

**Already consolidated** - All debug utilities are centralized:
- `debug()`, `info()`, `warn()`, `error()`
- `logger` object with all methods
- Environment filtering via `DEBUG=true`
- PII sanitization

### 4. Import Normalization

**Status:** Identified but not automated

**Found:** 42 files using `@parel/db` import

**Target:** Replace with `@/lib/db`

**Note:** This migration should be done incrementally.

### 5. Mock Data Cleanup

**Status:** Already cleaned - No `mock-data.ts` files found.

## Migration Checklist

- [x] Merge constants into canonical source
- [x] Add error handler aliases
- [x] Verify debug utilities
- [ ] Normalize imports (`@parel/db` â†’ `@/lib/db`) - 42 files pending
- [x] Remove mock-data remnants (already cleaned)

## Backward Compatibility

- Existing error handler exports remain unchanged
- Constants merged but old files still exist (can be deleted after migration)
- New aliases are optional (old imports still work)