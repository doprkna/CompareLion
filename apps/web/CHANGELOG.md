## [0.35.9] - Full Demo World Seed Script + Login Redirect to Landing

### Goal
Create a fully populated demo world with 20 users, 10 questions, 8 shop items, messages, notifications, and an active world event to make admin dashboard fully populated. Expanded admin reseed API route to seed everything. Change post-login redirect from /main to /landing page.

### Fixed
- [x] Admin reseed API endpoint 503 crash resolved
  - **Modified:** `apps/web/app/api/admin/reseed/route.ts` - Wrapped POST handler in `safeAsync()` to prevent 503 errors
  - **Added:** Comprehensive error handling with try/catch blocks for each seeding step
  - **Added:** Detailed console logging at each step (🔁 Request, 👥 Users, 🏆 Achievements, etc.)
  - **Added:** Error collection array - partial failures don't crash the entire reseed
  - **Result:** Reseed always returns JSON response, even if some steps fail
- [x] Admin dashboard not showing seeded data
  - **Modified:** `apps/web/app/api/admin/overview/route.ts` - Fixed table name mismatches
  - **Issue:** Dashboard was querying `prisma.question` but we seed `flowQuestion`
  - **Issue:** Dashboard was querying `prisma.worldEvent` but we seed `globalEvent`
  - **Fix:** Changed to `prisma.flowQuestion.count()` and `prisma.globalEvent.count({ where: { active: true } })`
  - **Result:** Dashboard now correctly displays all seeded data
- [x] Items and Notifications not seeding due to schema field mismatches
  - **Modified:** `apps/web/app/api/admin/reseed/route.ts` - Fixed field names to match Prisma schema
  - **Issue:** Notification model uses `body` field but we were passing `message`
  - **Issue:** Item model uses `goldPrice`, `emoji`, `key` fields but we were passing `price`, `icon`, `currency`, `power`, `defense`, `effect`, `bonus`
  - **Fix:** Updated Item fields to use schema format (key, name, emoji, type, rarity, description, goldPrice, isShopItem)
  - **Fix:** Updated Notification field from `message:` to `body:`
  - **Result:** Items and notifications now seed correctly
- [x] Post-login redirect now goes to Landing page instead of Main
  - **Modified:** `apps/web/app/login/page.tsx` - Changed two redirects from `/main` to `/landing`
  - **Modified:** `apps/web/app/signup/page.tsx` - Changed redirect from `/main` to `/landing`
  - **Behavior:** After successful login or if already authenticated, users land on `/landing` page
  - **Note:** Users can still manually navigate to `/main` if needed (button on landing page works)
  - **Result:** Authenticated users see landing page first, not main dashboard
- [x] Landing page navigation and access improved
  - **Modified:** `apps/web/components/NavLinks.tsx` - Added `/landing` as first link in coreLinks array
  - **Modified:** `apps/web/components/ConditionalNav.tsx` - **Kept** `/landing` in hidden pages list to prevent overlap (landing has own nav)
  - **Modified:** `apps/web/app/routes.ts` - Added Landing to coreRoutes for consistency
  - **Modified:** `apps/web/app/landing/page.tsx` - Removed auto-redirect logic based on skipLandingAfterLogin localStorage
  - **Solution:** Landing link appears in nav menu on OTHER pages (main, profile, etc.) but NOT on landing page itself
  - **Reason:** Landing page has built-in navigation - showing global nav would cause overlap (v0.35.3-navfix issue)
  - **Behavior:** Users see "Landing" link when browsing app, can click to return to landing page
  - **Result:** No navigation overlap, users can freely access landing page from other pages via nav menu
- [x] Admin reseed button now seeds complete demo world
  - **Expanded:** From 2 users to full 20-user seeding
  - **Added:** Shop items seeding (8 items from 100g to 3500g)
  - **Added:** Questions seeding (10 flow questions with options)
  - **Added:** Messages seeding (10 cross-user messages)
  - **Added:** Notifications seeding (25 system notifications)
  - **Added:** World event seeding (1 active Winter Festival)
  - **Added:** Leaderboard entries for all users
  - **Result:** Clicking "Reseed DB" button populates entire dashboard with data

### Added
- [x] **Expanded seed script** in `packages/db/prisma/seed.ts`
  - **20 users** with varied stats (Level 4-15, XP 2800-15000)
    - Admin: admin@example.com (Level 15, 15000 XP, 5000 gold)
    - Demo: demo@example.com (Level 10, 8500 XP, 2100 gold)
    - 18 regular users with realistic names and stats
  - **10 flow questions** covering different categories
    - Exercise frequency, Motivation, Feedback handling
    - Work style, Sleep hours, Communication style
    - Challenge approach, Learning methods, Stress management, Goal setting
  - **8 shop items** (common to legendary)
    - Badges: Bronze (100g), Silver (300g), Golden (800g), Crown (2000g)
    - Consumables: XP Booster (500g), Coin Pack (250g)
    - Accessories: Crystal Aura (1200g), Dragon Emblem (3500g)
  - **10 messages** between users
  - **25 notifications** (5 types × 5 users)
    - Welcome, Shop Update, Event Incoming, Survey, Maintenance
  - **1 active world event**: Winter Festival
    - 25% bonus to all activities
    - Runs for 7 days
    - Limited-time challenges
  - **20 leaderboard entries** (all users ranked)
  - **Report stats** updated for admin dashboard

### Features
- All users have unique names (Alice, Bob, Charlie, Diana, Eva, etc.)
- XP distribution creates realistic leaderboard (2800-15000 XP range)
- Karma and prestige scores for social ranking (28-100 range)
- All passwords = "password123" for easy testing
- Messages spread over multiple hours for realism
- Notifications spread over multiple days
- Full category hierarchy for questions (Category → SubCategory → SubSubCategory → Leaf)

### Run Command
```bash
pnpm db:push && pnpm db:seed
```

or

```bash
npx tsx packages/db/prisma/seed.ts
```

### What Gets Populated
- **Leaderboards**: All 20 users ranked by XP
- **Shop Page**: 8 items from badges to legendary accessories
- **Questions**: 10 flow questions with 4 options each
- **Messages**: 10 cross-user conversations
- **Notifications**: 25 system notifications
- **Events**: 1 active Winter Festival (bonus XP event)
- **Achievements**: 16 achievements across 5 categories
- **Admin Dashboard**: All tiles show data

### How to Use (Easiest Method)
1. **Navigate to** `/admin` in your browser
2. **Click** "Reseed DB" button
3. **Watch terminal** for detailed progress logs:
   ```
   🔁 [Reseed] Request received from admin...
   ✅ [Reseed] Admin authenticated, starting comprehensive seed...
   👥 [Reseed] Seeding 20 users...
      ✅ 20 users created/updated
   🏆 [Reseed] Seeding achievements...
      ✅ 16 achievements created/updated
   📦 [Reseed] Seeding shop items...
      ✅ 8 shop items created/updated
   ❓ [Reseed] Seeding questions...
      ✅ 10 questions in database
   💬 [Reseed] Seeding messages...
      ✅ 10 messages created
   🔔 [Reseed] Seeding notifications...
      ✅ 25 notifications created
   🌍 [Reseed] Seeding world event...
      ✅ 1 active event(s) created
   🏅 [Reseed] Seeding leaderboard...
      ✅ 20 leaderboard entries created
   
   ✅ [Reseed] Complete! Duration: 2.5s
   📊 [Reseed] Final Stats: { users: 20, achievements: 16, items: 8, ... }
   ```
4. **Check response** - Enhanced message shows exactly what was created:
   ```json
   {
     "success": true,
     "message": "Database reseeded successfully!\n\nCreated: 👥 20 users, 🏆 16 achievements, 📦 8 shop items, ❓ 10 questions, 💬 10 messages, 🔔 25 notifications, 🌍 1 active events, 🏅 20 leaderboard entries",
     "summary": "👥 20 users, 🏆 16 achievements, 📦 8 shop items, ❓ 10 questions, 💬 10 messages, 🔔 25 notifications, 🌍 1 active events, 🏅 20 leaderboard entries",
     "stats": {
       "users": 20,
       "achievements": 16,
       "items": 8,
       "messages": 10,
       "notifications": 25,
       "questions": 10,
       "events": 1,
       "leaderboard": 20,
       "duration": "2.5s"
     }
   }
   ```
5. **Refresh admin dashboard** - all tiles should be green with data!

### Post-Login Behavior (v0.35.9)
**Before:**
```
Login → /main (dashboard)
Signup → /main (dashboard)
```

**After:**
```
Login → /landing (overview page)
Signup → /landing (overview page)
```

**Manual navigation still works:**
- Users can click "Continue to Dashboard" button on landing page to go to `/main`
- Direct navigation to `/main` works
- Middleware doesn't redirect away from `/landing`

---

## [0.35.8] - Comprehensive Prisma Seed Script for Full Demo World + Reseed Fix

### Goal
Create a fully populated development environment with varied user stats, achievements, shop items, inventory, leaderboards, and all necessary data for testing all features. Fix admin reseed API route shell command error.

### Added
- [x] Comprehensive seed script in `packages/db/prisma/seed.ts`
  - **16 users** with varied XP/levels (including admin@example.com and demo@example.com)
  - **16 achievements** across 5 categories (combat, mind, social, commerce, integration)
  - **18 shop items** (common to legendary rarity)
  - **User inventories** (2-5 items per user based on level)
  - **Leaderboard entries** (all users ranked by XP)
  - **Report stats** (dashboard-ready metrics)
  - **30 messages** (cross-user communication)
  - **3 flow questions** (with options)
  - **5 groups/totems** (with members)
  - **User achievements** (assigned based on level)

### Fixed
- [x] Admin reseed API route shell command error
  - **Modified:** `apps/web/app/api/admin/reseed/route.ts` - Replaced shell command `pnpm db:reset-seed` with internal seeding functions
  - **Issue:** Command was failing with "Command 'db:reset-seed' not found" because packages/db directory doesn't exist
  - **Solution:** Now uses seedAchievements() and direct Prisma calls instead of shell execution
  - **Result:** Reseed button in admin panel now works without shell command errors

### Features
- Users range from Level 3 to Level 10 with realistic XP distribution (1500-12000 XP)
- Shop items include weapons, armor, badges, consumables with varied rarities
- Karma and prestige scores for social ranking
- All password hashes = "password123" for easy testing
- Audit logs for all seeding operations

### Run Command
```bash
pnpm db:push && pnpm db:seed
```

or

```bash
npx tsx packages/db/prisma/seed.ts
```

### What Gets Populated
- **Leaderboards**: 16 users ranked by XP
- **Shop Page**: 18 items from bronze badges to legendary weapons
- **Inventory**: Each user has 2-5 items
- **Achievements Page**: 16 achievements with unlock progress
- **Admin Dashboard**: Full stats (users, items, achievements counts)
- **Messages**: 30 cross-user messages
- **Groups**: 5 totems with members

---

## [0.35.7] - HTTP 401 Handler + FeatureGuard Router Warning Fix + Sentry/Logger Spam Cleanup + Achievements Fix

### Goal
Fix HTTP 401 user load logic to handle expired sessions gracefully, resolve React warning about router updates during render in FeatureGuard, disable Sentry/logger debug spam during development, and fix achievements not loading due to empty database table.

### Fixed
- [x] HTTP 401 "Failed to load user data" now properly handled
  - **Modified:** `apps/web/lib/apiClient.ts` - Changed apiFetch return signature to include status, explicit 401 handling with console warning
  - **Modified:** `apps/web/app/main/page.tsx` - Added 401 check and redirect to login on session expiry
  - **Modified:** `apps/web/app/landing/page.tsx` - Added 401 safe handling (no redirect on public page)
  - **Result:** No more HTTP 401 crashes, graceful redirect to login when session expires
- [x] FeatureGuard "Cannot update a component (Router) while rendering" warning resolved
  - **Modified:** `apps/web/components/FeatureGuard.tsx` - Moved router.push to useEffect hook
  - **Result:** No more React warning, smoother guarded navigation
- [x] Sentry and logger spam disabled in development
  - **Modified:** `apps/web/.env` + `apps/web/.env.local` - Cleared SENTRY_DSN values, added LOG_LEVEL=error
  - **Modified:** `apps/web/instrumentation.ts` - Wrapped Sentry.init in production-only guards
  - **Modified:** `apps/web/instrumentation-client.ts` - Added production-only guard to client Sentry init
  - **Modified:** `apps/web/lib/logger.ts` - Added shouldLog() method respecting LOG_LEVEL env variable
  - **Modified:** `apps/web/lib/utils/errorTracking.ts` - Production-only guards on Sentry.capture calls
  - **Modified:** `apps/web/lib/monitoring/error-tracker.ts` - Production-only guards on Sentry.capture calls
  - **Result:** Clean console during dev, only errors/warnings shown. Sentry only active in production
- [x] Achievements not loading fixed
  - **Modified:** `apps/web/hooks/useAchievements.ts` - Fixed response structure parsing (data.data.achievements), added 401 handling, improved error logging
  - **Modified:** `apps/web/app/api/admin/seed-db/route.ts` - Added seedAchievements() call to admin seeder
  - **Modified:** `apps/web/lib/seed-achievements.ts` - Added return value with created/skipped counts
  - **Result:** Achievements now load correctly after running admin seed. Hook properly parses API response structure

### Changes
**1. apiClient.ts - New return signature:**
```typescript
// Before: Promise<T | null>
// After: Promise<{ ok: boolean; data: T | null; error?: string; status?: number }>

// Added explicit 401 handling:
if (res.status === 401) {
  console.warn(`[apiFetch] HTTP 401 on ${path} - Session expired`); // sanity-fix
  return { ok: false, data: null, error: "Session expired or not authenticated", status: 401 };
}
```

**2. main/page.tsx - 401 redirect:**
```tsx
const res = await apiFetch("/api/user/summary");

// Handle 401 - session expired, redirect to login
if (res.status === 401) {
  console.warn("Session expired, redirecting to login."); // sanity-fix
  router.push("/login"); // sanity-fix
  return;
}
```

**3. FeatureGuard.tsx - useEffect redirect:**
```tsx
// Before (in render):
if (!isFeatureEnabled(feature)) {
  if (redirectTo) {
    router.push(redirectTo);  // ❌ Causes warning
    return null;
  }
}

// After (in useEffect):
useEffect(() => {
  if (!featureEnabled && redirectTo) {
    router.push(redirectTo); // sanity-fix
  }
}, [featureEnabled, redirectTo, router]);
```

**4. Logger LOG_LEVEL support:**
```typescript
// Added shouldLog() method to check LOG_LEVEL env
private shouldLog(level: LogLevel): boolean {
  const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentIndex = levels.indexOf(logLevel);
  const messageIndex = levels.indexOf(level.toLowerCase());
  return messageIndex >= currentIndex;
}

// With LOG_LEVEL=error, only error logs are shown
```

**5. Sentry production-only guards:**
```typescript
// All Sentry.init() calls now wrapped:
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({...});
}

// All Sentry.capture calls wrapped:
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.captureException(error);
}
```

**6. Achievements response parsing fix:**
```typescript
// Before: Checking wrong structure
if (data.success && data.achievements) { ... }

// After: Correctly parsing successResponse wrapper
if (data.success && data.data?.achievements) {
  const achievementsData = data.data.achievements;
  // Flatten categories into single array
  const allAchievements: Achievement[] = Object.values(achievementsData).flat();
  setAchievements(allAchievements);
  setCategories(achievementsData);
}
```

### Behavior
- Expired sessions are detected via 401 status and trigger clean redirect to login
- API fetch errors now include status codes for better debugging
- FeatureGuard redirects happen in useEffect to comply with React rules
- Landing page handles 401 gracefully without redirecting (public access)
- **Development console is now clean - only errors/warnings shown**
- **Sentry disabled in dev, only sends data in production**
- **logger.debug() and logger.info() suppressed when LOG_LEVEL=error**
- **Achievements now seed automatically when running admin DB seeder**
- **Achievement hook properly parses API successResponse format**

### How to Fix Achievements Not Loading
1. Navigate to `/admin` (requires admin role)
2. Click "Seed Database" button
3. This will create 16 base achievements across categories: combat, mind, social, commerce, integration
4. Refresh achievements page - should now display all achievements

---

## [0.35.6] - Reports Page Crash Fix and Seed Data Update

### Goal
Fix ReportsPage runtime crash when API returns undefined stats, and ensure seed script has proper admin/demo data for testing.

### Fixed
- [x] ReportsPage /api/reports crash - Added safe fallbacks for all Prisma count queries
- [x] API returns valid stats structure - Wrapped user query with .catch(() => [])
- [x] XP range display fixed - Clean range labels in proper format
- [x] User name fallbacks - Safe handling with: name || email?.split('@')[0] || 'Unknown'

### Verified
- [x] Seed script (packages/db/seed.ts) ready with admin and demo users
  - Admin: admin@example.com / 1AmTheArchitect (Level 99, 9999 XP, 5000 funds)
  - Demo: demo@example.com / demo (Level 10, 2500 XP, 1000 funds)
  - 20 total users with stats, messages, achievements

### Technical Notes
- Comment marker: // Safe counts with fallbacks - sanity-fix v0.35.6
- Modified: apps/web/app/api/reports/route.ts

# CHANGELOG

## [0.35.5] - "Runtime Safety Fixes - Marketplace, Main & Admin Pages"

### Goal
Fix runtime TypeErrors when data is undefined in marketplace filtering, event bus operations, and admin feedback search.

### Fixed
- [x] Marketplace items.filter() crash on undefined items array
  - **Modified:** `apps/web/app/marketplace/page.tsx` - Added safe fallback for items array in filter operation
  - **Result:** No more `TypeError: cannot read property 'filter' of undefined`
- [x] Marketplace filteredItems undefined when activeCategory is 'all'
  - **Modified:** `apps/web/app/marketplace/page.tsx` - Added safe fallback for items in 'all' category path
  - **Result:** MarketGrid receives empty array instead of undefined
- [x] Main page XP event bus crash on undefined eventData
  - **Modified:** `apps/web/app/main/page.tsx` - Added safe optional chaining to eventData.userId
  - **Result:** No more `TypeError: cannot read property 'userId' of undefined`
- [x] Admin feedback search crash on null/undefined title or description
  - **Modified:** `apps/web/app/admin/feedback/page.tsx` - Added safe optional chaining to item.title and item.description
  - **Result:** No more `TypeError: cannot read property 'toLowerCase' of null/undefined`
- [x] Groups page crash on undefined groups array
  - **Modified:** `apps/web/app/groups/page.tsx` - Added safe fallback for groups.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined`
- [x] Main page XP update crash on undefined newXp property
  - **Modified:** `apps/web/app/main/page.tsx` - Added safe optional chaining to eventData.newXp with fallback
  - **Result:** No more issues when XP event data is incomplete
- [x] Feed page crash on undefined items array in sortedItems
  - **Modified:** `apps/web/app/feed/page.tsx` - Added safe fallback for items spread and return
  - **Result:** No more `TypeError: items is not iterable` when sorting
- [x] Feed page crash on undefined prev in onReact optimistic update
  - **Modified:** `apps/web/app/feed/page.tsx` - Added safe fallback for prev.map() in setItems
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when reacting
- [x] Admin system list crash on undefined records from Prisma query
  - **Modified:** `apps/web/app/api/admin/[system]/list/route.ts` - Added safe fallback for records.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when sanitizing records
- [x] Fireside API crash on undefined participantIds array
  - **Modified:** `apps/web/app/api/firesides/[id]/route.ts` - Added safe fallback for participantIds.includes()
  - **Result:** No more `TypeError: cannot read property 'includes' of undefined` when checking access
- [x] Feed API crash on undefined reactions array in reduce operation
  - **Modified:** `apps/web/app/api/feed/route.ts` - Added safe fallback for item.reactions.reduce()
  - **Result:** No more `TypeError: cannot read property 'reduce' of undefined` when grouping reactions
- [x] Feed API crash on undefined user reactions in reduce operation
  - **Modified:** `apps/web/app/api/feed/route.ts` - Added safe fallback for reactions.reduce() for user reactions
  - **Result:** No more `TypeError: cannot read property 'reduce' of undefined` when building user reactions map
- [x] Feed API crash on undefined email in split operation
  - **Modified:** `apps/web/app/api/feed/route.ts` - Added safe optional chaining to email.split() with fallback
  - **Result:** No more `TypeError: cannot read property 'split' of undefined` when formatting user name
- [x] Leaderboard API crash on undefined email in split operation (multiple instances)
  - **Modified:** `apps/web/app/api/leaderboard/route.ts` - Added safe optional chaining to email.split() with fallback
  - **Result:** No more `TypeError: cannot read property 'split' of undefined` when formatting display names
- [x] Compare API crash on undefined email in split operation (multiple instances)
  - **Modified:** `apps/web/app/api/compare/route.ts` - Added safe optional chaining to email.split() with fallback
  - **Result:** No more `TypeError: cannot read property 'split' of undefined` when formatting user names
- [x] Admin users page crash on undefined email in split operation
  - **Modified:** `apps/web/app/admin/users/page.tsx` - Added safe optional chaining to email.split() with fallback
  - **Result:** No more `TypeError: cannot read property 'split' of undefined` when displaying user names
- [x] Synch test result API crash on undefined test properties
  - **Modified:** `apps/web/app/api/synch-tests/result/[id]/route.ts` - Added safe optional chaining to test.title and test.description
  - **Result:** No more `TypeError: cannot read property 'title' of null` when fetching incomplete test results
- [x] Feed page crash on undefined answers array in slice operation
  - **Modified:** `apps/web/app/feed/page.tsx` - Added safe fallback for item.answers.slice()
  - **Result:** No more `TypeError: cannot read property 'slice' of undefined` when displaying feed item answers
- [x] Challenges page crash on undefined daily array in map operation
  - **Modified:** `apps/web/app/challenges/page.tsx` - Added safe fallback for apiData.daily.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when applying daily challenge progress
- [x] Challenges page crash on undefined weekly array in map operation
  - **Modified:** `apps/web/app/challenges/page.tsx` - Added safe fallback for apiData.weekly.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when applying weekly challenge progress
- [x] Groups API crash on undefined memberships array in map operation
  - **Modified:** `apps/web/app/api/groups/route.ts` - Added safe fallback for memberships.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when formatting groups
- [x] Micro clans API crash on undefined members array in spread operation
  - **Modified:** `apps/web/app/api/micro-clans/[id]/route.ts` - Added safe fallback for members spread
  - **Result:** No more `TypeError: members is not iterable` when creating allMembers array
- [x] Compare API crash on undefined userAchievements array (multiple instances)
  - **Modified:** `apps/web/app/api/compare/route.ts` - Added safe optional chaining to userAchievements.length
  - **Result:** No more `TypeError: cannot read property 'length' of undefined` when counting achievements
- [x] Admin presets apply crash on undefined modifiers object
  - **Modified:** `apps/web/app/api/admin/presets/apply/route.ts` - Added safe fallback for Object.entries(modifiers)
  - **Result:** No more `TypeError: Cannot convert undefined to object` when applying preset modifiers
- [x] Activity API crash on malformed JSON metadata
  - **Modified:** `apps/web/app/api/activity/route.ts` - Added try-catch wrapper for JSON.parse(metadata)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed metadata strings
- [x] Audit API crash on malformed JSON meta
  - **Modified:** `apps/web/app/api/audit/route.ts` - Added try-catch wrapper for JSON.parse(meta)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed audit log meta strings
- [x] Activity recent API crash on malformed JSON metadata
  - **Modified:** `apps/web/app/api/activity/recent/route.ts` - Added try-catch wrapper for JSON.parse(metadata)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed activity metadata strings
- [x] Admin API map crash on malformed JSON content
  - **Modified:** `apps/web/app/api/admin/api-map/route.ts` - Added try-catch wrapper for JSON.parse(content)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed API map files
- [x] Challenges page crash on malformed localStorage JSON
  - **Modified:** `apps/web/app/challenges/page.tsx` - Added try-catch wrapper for JSON.parse(savedProgress)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed challenge progress from localStorage
- [x] Admin DB summary crash on malformed JSON content
  - **Modified:** `apps/web/app/api/admin/db/summary/route.ts` - Added try-catch wrapper for JSON.parse(content)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed integrity report files
- [x] Events today API crash on malformed Redis cache JSON
  - **Modified:** `apps/web/app/api/events/today/route.ts` - Added try-catch wrapper for JSON.parse(cached)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed cached event data from Redis
- [x] Forks choose API crash on malformed effect JSON
  - **Modified:** `apps/web/app/api/forks/choose/route.ts` - Added try-catch wrapper for JSON.parse(effect)
  - **Result:** No more `SyntaxError: Unexpected token` when parsing malformed fork effect data
- [x] AI quote API crash on malformed quotes.json file
  - **Modified:** `apps/web/app/api/ai/quote/route.ts` - Added try-catch wrapper for JSON.parse(quotesData)
  - **Result:** No more `SyntaxError: Unexpected token` during module initialization when quotes.json is malformed
- [x] Admin users page crash on null/undefined xp and funds
  - **Modified:** `apps/web/app/admin/users/page.tsx` - Added nullish coalescing for xp and funds in table rows
  - **Result:** No more `TypeError: Cannot read property 'toLocaleString' of null` when displaying user stats
- [x] Admin users page crash on undefined users array in reduce operation
  - **Modified:** `apps/web/app/admin/users/page.tsx` - Added safe fallback for users.reduce() in total XP calculation
  - **Result:** No more `TypeError: cannot read property 'reduce' of undefined` when calculating total XP
- [x] Admin users page crash on undefined users array in questionsAnswered reduce
  - **Modified:** `apps/web/app/admin/users/page.tsx` - Added safe fallback for users.reduce() in questions answered calculation
  - **Result:** No more `TypeError: cannot read property 'reduce' of undefined` when calculating total questions
- [x] Micro clans API crash on undefined memberIds array
  - **Modified:** `apps/web/app/api/micro-clans/[id]/route.ts` - Added safe fallback for clan.memberIds
  - **Result:** No more issues when memberIds is null/undefined during member query
- [x] Fireside react API crash on undefined participantIds array
  - **Modified:** `apps/web/app/api/firesides/react/route.ts` - Added safe fallback for participantIds.includes()
  - **Result:** No more `TypeError: cannot read property 'includes' of undefined` when checking reaction access
- [x] Admin API map crash on undefined array length, slice, and Object.keys access
  - **Modified:** `apps/web/app/api/admin/api-map/route.ts` - Added safe optional chaining to array length properties, slice operations, and Object.keys
  - **Result:** No more `TypeError: cannot read property 'length' of undefined` or `Cannot convert undefined to object` when building API map summary
- [x] Admin DB summary crash on undefined results array
  - **Modified:** `apps/web/app/api/admin/db/summary/route.ts` - Added safe fallback for summary.results.slice() and results.length
  - **Result:** No more `TypeError: cannot read property 'slice' of undefined` when building DB summary
- [x] Groups stats API crash on undefined members array
  - **Modified:** `apps/web/app/api/groups/[id]/stats/route.ts` - Added safe fallback for members.map()
  - **Result:** No more `TypeError: cannot read property 'map' of undefined` when extracting user IDs
- [x] Groups stats API crash on undefined users array in reduce operations
  - **Modified:** `apps/web/app/api/groups/[id]/stats/route.ts` - Added safe fallback for users.reduce() and division-by-zero check
  - **Result:** No more `TypeError: cannot read property 'reduce' of undefined` when calculating stats

### Changes
**1. Line 27-28 fix (marketplace/page.tsx):**
```tsx
// Before:
const filteredItems = activeCategory === 'all' 
  ? items 
  : items.filter(item => item.category === activeCategory);

// After:
const filteredItems = activeCategory === 'all' 
  ? (items || []) // sanity-fix
  : (items || []).filter(item => item.category === activeCategory); // sanity-fix
```

**2. Line 103 fix (main/page.tsx):**
```tsx
// Before:
if (session?.user?.id && eventData.userId === session.user.id) {

// After:
if (session?.user?.id && eventData?.userId === session.user.id) { // sanity-fix
```

**3. Line 151-152 fix (admin/feedback/page.tsx):**
```tsx
// Before:
const matchesTitle = item.title.toLowerCase().includes(query);
const matchesDescription = item.description.toLowerCase().includes(query);

// After:
const matchesTitle = item.title?.toLowerCase().includes(query); // sanity-fix
const matchesDescription = item.description?.toLowerCase().includes(query); // sanity-fix
```

**4. Line 17 fix (groups/page.tsx):**
```tsx
// Before:
{groups.map((g) => (

// After:
{(groups || []).map((g) => ( // sanity-fix
```

**5. Line 106 fix (main/page.tsx):**
```tsx
// Before:
const newXp = eventData.newXp;

// After:
const newXp = eventData?.newXp ?? prev.xp; // sanity-fix
```

**6. Line 174-175 fix (feed/page.tsx - sortedItems):**
```tsx
// Before:
if (sortMode === 'recent') return items;
return [...items].sort((a, b) => {

// After:
if (sortMode === 'recent') return items || []; // sanity-fix
return [...(items || [])].sort((a, b) => { // sanity-fix
```

**7. Line 164 fix (feed/page.tsx - onReact):**
```tsx
// Before:
setItems(prev => prev.map(it => {

// After:
setItems(prev => (prev || []).map(it => { // sanity-fix
```

**8. Line 64 fix (api/admin/[system]/list/route.ts):**
```typescript
// Before:
const sanitized = records.map((record: any) => {

// After:
const sanitized = (records || []).map((record: any) => { // sanity-fix
```

**9. Line 15 fix (api/firesides/[id]/route.ts):**
```typescript
// Before:
if (fs.creatorId !== me.id && !fs.participantIds.includes(me.id))

// After:
if (fs.creatorId !== me.id && !(fs.participantIds || []).includes(me.id)) // sanity-fix
```

**10. Line 94 fix (api/feed/route.ts - item reactions):**
```typescript
// Before:
const reactionSummary = item.reactions.reduce((acc, r) => {

// After:
const reactionSummary = (item.reactions || []).reduce((acc, r) => { // sanity-fix
```

**11. Line 84 fix (api/feed/route.ts - user reactions):**
```typescript
// Before:
userReactions = reactions.reduce((acc, r) => {

// After:
userReactions = (reactions || []).reduce((acc, r) => { // sanity-fix
```

**12. Line 108 fix (api/feed/route.ts - email split):**
```typescript
// Before:
name: item.user.name || item.user.email.split("@")[0],

// After:
name: item.user.name || item.user.email?.split("@")[0] || 'Unknown', // sanity-fix
```

**13. Line 78, 151 & 189 fix (api/leaderboard/route.ts - email split):**
```typescript
// Before:
displayName: currentUser.name || currentUser.email.split('@')[0],
displayName: user.name || user.email.split('@')[0],

// After:
displayName: currentUser.name || currentUser.email?.split('@')[0] || 'Unknown', // sanity-fix
displayName: user.name || user.email?.split('@')[0] || 'Unknown', // sanity-fix
```

**14. Line 99 & 121 fix (api/compare/route.ts - email split):**
```typescript
// Before:
name: currentUser.name || currentUser.email.split('@')[0],
name: targetUser.name || targetUser.email.split('@')[0],

// After:
name: currentUser.name || currentUser.email?.split('@')[0] || 'Unknown', // sanity-fix
name: targetUser.name || targetUser.email?.split('@')[0] || 'Unknown', // sanity-fix
```

**15. Line 186 fix (admin/users/page.tsx - email split):**
```tsx
// Before:
{user.name || user.email.split('@')[0]}

// After:
{user.name || user.email?.split('@')[0] || 'Unknown'} {/* sanity-fix */}
```

**16. Line 32 fix (api/synch-tests/result/[id]/route.ts - test properties):**
```typescript
// Before:
test: { title: userTest.test.title, description: userTest.test.description },

// After:
test: { title: userTest.test?.title || 'Test', description: userTest.test?.description || '' }, // sanity-fix
```

**17. Line 273 fix (feed/page.tsx - answers slice):**
```tsx
// Before:
{item.answers.slice(0, 2).map((a, idx) => (

// After:
{(item.answers || []).slice(0, 2).map((a, idx) => ( // sanity-fix
```

**18. Line 75 & 81 fix (challenges/page.tsx - daily & weekly map):**
```tsx
// Before:
apiData.daily = apiData.daily.map((c: Challenge) => ({
apiData.weekly = apiData.weekly.map((c: Challenge) => ({

// After:
apiData.daily = (apiData.daily || []).map((c: Challenge) => ({ // sanity-fix
apiData.weekly = (apiData.weekly || []).map((c: Challenge) => ({ // sanity-fix
```

**19. Line 29 fix (api/groups/route.ts - memberships map):**
```typescript
// Before:
const groups = memberships.map((m) => ({

// After:
const groups = (memberships || []).map((m) => ({ // sanity-fix
```

**20. Line 43 fix (api/micro-clans/[id]/route.ts - members spread):**
```typescript
// Before:
const allMembers = [clan.leader, ...members];

// After:
const allMembers = [clan.leader, ...(members || [])]; // sanity-fix
```

**21. Line 117 & 139 fix (api/compare/route.ts - userAchievements length):**
```typescript
// Before:
achievementCount: currentUser.userAchievements.length,
achievementCount: targetUser.userAchievements.length,

// After:
achievementCount: currentUser.userAchievements?.length || 0, // sanity-fix
achievementCount: targetUser.userAchievements?.length || 0, // sanity-fix
```

**22. Line 54 fix (api/admin/presets/apply/route.ts - modifiers Object.entries):**
```typescript
// Before:
const updatePromises = Object.entries(modifiers).map(([key, value]) =>

// After:
const updatePromises = Object.entries(modifiers || {}).map(([key, value]) => // sanity-fix
```

**23. Line 35 fix (api/activity/route.ts - JSON.parse safety):**
```typescript
// Before:
metadata: activity.metadata 
  ? (typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata)
  : null,

// After:
metadata: activity.metadata 
  ? (typeof activity.metadata === 'string' 
    ? (() => { try { return JSON.parse(activity.metadata); } catch { return null; } })() // sanity-fix
    : activity.metadata)
  : null,
```

**24. Line 33 fix (api/audit/route.ts - JSON.parse safety):**
```typescript
// Before:
meta: log.meta ? (typeof log.meta === 'string' ? JSON.parse(log.meta) : log.meta) : null,

// After:
meta: log.meta ? (typeof log.meta === 'string' ? (() => { try { return JSON.parse(log.meta); } catch { return null; } })() : log.meta) : null, // sanity-fix
```

**25. Line 36 fix (api/activity/recent/route.ts - JSON.parse safety):**
```typescript
// Before:
metadata: activity.metadata
  ? typeof activity.metadata === 'string'
    ? JSON.parse(activity.metadata)
    : activity.metadata
  : null,

// After:
metadata: activity.metadata
  ? typeof activity.metadata === 'string'
    ? (() => { try { return JSON.parse(activity.metadata); } catch { return null; } })() // sanity-fix
    : activity.metadata
  : null,
```

**26. Line 47-52 fix (api/admin/api-map/route.ts - JSON.parse safety):**
```typescript
// Before:
const apiMap = JSON.parse(content);

// After:
let apiMap; // sanity-fix
try { // sanity-fix
  apiMap = JSON.parse(content); // sanity-fix
} catch { // sanity-fix
  return successResponse({ available: false, message: 'Invalid JSON in API map file' }); // sanity-fix
} // sanity-fix
```

**27. Line 56 fix (challenges/page.tsx - JSON.parse localStorage safety):**
```tsx
// Before:
const progressData = savedProgress ? JSON.parse(savedProgress) : {};

// After:
const progressData = savedProgress ? (() => { try { return JSON.parse(savedProgress); } catch { return {}; } })() : {}; // sanity-fix
```

**28. Line 47-52 fix (api/admin/db/summary/route.ts - JSON.parse safety):**
```typescript
// Before:
const summary = JSON.parse(content);

// After:
let summary; // sanity-fix
try { // sanity-fix
  summary = JSON.parse(content); // sanity-fix
} catch { // sanity-fix
  return successResponse({ available: false, message: 'Invalid JSON in integrity file' }); // sanity-fix
} // sanity-fix
```

**29. Line 22-28 fix (api/events/today/route.ts - JSON.parse Redis cache safety):**
```typescript
// Before:
if (cached) {
  const res = NextResponse.json(JSON.parse(cached));
  res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  return res;
}

// After:
if (cached) {
  let parsedCache; // sanity-fix
  try { parsedCache = JSON.parse(cached); } catch { parsedCache = null; } // sanity-fix
  if (parsedCache) { // sanity-fix
    const res = NextResponse.json(parsedCache); // sanity-fix
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res;
  } // sanity-fix
}
```

**30. Line 79 fix (api/forks/choose/route.ts - JSON.parse effect safety):**
```typescript
// Before:
const effectData = typeof effect === 'object' ? effect : JSON.parse(effect || '{}');

// After:
const effectData = typeof effect === 'object' ? effect : (() => { try { return JSON.parse(effect || '{}'); } catch { return {}; } })(); // sanity-fix
```

**31. Line 24-30 fix (api/ai/quote/route.ts - JSON.parse module initialization safety):**
```typescript
// Before:
const { quotes }: { quotes: Quote[] } = JSON.parse(quotesData);

// After:
let quotes: Quote[] = []; // sanity-fix
try { // sanity-fix
  const parsed = JSON.parse(quotesData); // sanity-fix
  quotes = parsed.quotes || []; // sanity-fix
} catch { // sanity-fix
  quotes = []; // sanity-fix
} // sanity-fix
```

**32. Line 203 & 206 fix (admin/users/page.tsx - xp & funds null safety):**
```tsx
// Before:
{user.xp.toLocaleString()}
{Number(user.funds).toFixed(2)}

// After:
{(user.xp ?? 0).toLocaleString()} {/* sanity-fix */}
{Number(user.funds ?? 0).toFixed(2)} {/* sanity-fix */}
```

**33. Line 248 fix (admin/users/page.tsx - users reduce safety):**
```tsx
// Before:
{users.reduce((sum, user) => sum + user.xp, 0).toLocaleString()}

// After:
{(users || []).reduce((sum, user) => sum + (user.xp ?? 0), 0).toLocaleString()} {/* sanity-fix */}
```

**34. Line 256 fix (admin/users/page.tsx - questionsAnswered reduce safety):**
```tsx
// Before:
{users.reduce((sum, user) => sum + user.questionsAnswered, 0)}

// After:
{(users || []).reduce((sum, user) => sum + (user.questionsAnswered ?? 0), 0)} {/* sanity-fix */}
```

**35. Line 28 fix (api/micro-clans/[id]/route.ts - memberIds fallback):**
```typescript
// Before:
const memberIds = clan.memberIds;

// After:
const memberIds = clan.memberIds || []; // sanity-fix
```

**36. Line 23 fix (api/firesides/react/route.ts - participantIds includes):**
```typescript
// Before:
if (fs.creatorId !== me.id && !fs.participantIds.includes(me.id))

// After:
if (fs.creatorId !== me.id && !(fs.participantIds || []).includes(me.id)) // sanity-fix
```

**37. Line 61-70 fix (api/admin/api-map/route.ts - array length, slice & Object.keys safety):**
```typescript
// Before:
modelsUsed: apiMap.modelsUsed.length,
orphanedModels: apiMap.orphanedModels.length,
routesWithoutFe: apiMap.routesWithoutFe.length,
orphanedModels: apiMap.orphanedModels.slice(0, 20),
routesWithoutFe: apiMap.routesWithoutFe.slice(0, 20),
systems: Object.keys(apiMap.routesBySystem).map(system => ({
  count: apiMap.routesBySystem[system].length,

// After:
modelsUsed: apiMap.modelsUsed?.length || 0, // sanity-fix
orphanedModels: apiMap.orphanedModels?.length || 0, // sanity-fix
routesWithoutFe: apiMap.routesWithoutFe?.length || 0, // sanity-fix
orphanedModels: (apiMap.orphanedModels || []).slice(0, 20), // sanity-fix
routesWithoutFe: (apiMap.routesWithoutFe || []).slice(0, 20), // sanity-fix
systems: Object.keys(apiMap.routesBySystem || {}).map(system => ({ // sanity-fix
  count: apiMap.routesBySystem[system]?.length || 0, // sanity-fix
```

**38. Line 66-67 fix (api/admin/db/summary/route.ts - results array safety):**
```typescript
// Before:
sampleResults: summary.results.slice(0, 10),
totalResults: summary.results.length,

// After:
sampleResults: (summary.results || []).slice(0, 10), // sanity-fix
totalResults: summary.results?.length || 0, // sanity-fix
```

**39. Line 28 fix (api/groups/[id]/stats/route.ts - members map safety):**
```typescript
// Before:
const userIds = members.map((m) => m.userId);

// After:
const userIds = (members || []).map((m) => m.userId); // sanity-fix
```

**40. Line 39-40 fix (api/groups/[id]/stats/route.ts - users reduce safety):**
```typescript
// Before:
const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
const avgLevel = Math.round(users.reduce((sum, u) => sum + (u.level || 0), 0) / users.length);

// After:
const totalXP = (users || []).reduce((sum, u) => sum + (u.xp || 0), 0); // sanity-fix
const avgLevel = (users || []).length > 0 ? Math.round((users || []).reduce((sum, u) => sum + (u.level || 0), 0) / (users || []).length) : 0; // sanity-fix
```

**Behavior:** Safe optional chaining, fallback arrays, and try-catch wrappers prevent crashes when properties are null/undefined or JSON is malformed.

---

## [0.35.4c] - "StatsPanel XP Progress Safe Access Fix"

### Goal
Fix runtime TypeError when xpProgress is undefined in profile stats panel.

### Fixed
- [x] StatsPanel XP progress bar crash on undefined xpProgress
  - **Modified:** `apps/web/app/profile/components/StatsPanel.tsx` - Added safe optional chaining with fallback
  - **Result:** No more `TypeError: can't access property 'progress', xpProgress is undefined`

### Changes
**Line 102 fix (StatsPanel.tsx):**
```tsx
// Before:
style={{ width: `${xpProgress.progress * 100}%` }}

// After:
style={{ width: `${(xpProgress?.progress ?? 0) * 100}%` }}
```

**Behavior:** When xpProgress is undefined, progress bar width defaults to 0% instead of crashing.

---

## [0.35.4b] - "Leaderboard Null Check Fix + AmbientManager ReferenceError Fix"

### Goal
Fix runtime TypeError when leaderboard data is undefined and ReferenceError in AmbientManager component.

### Fixed
- [x] Leaderboard page crash on undefined data.leaderboard
  - **Modified:** `apps/web/app/leaderboard/page.tsx` - Added null check for `data.leaderboard` before accessing `.length`
  - **Result:** No more `TypeError: can't access property "length", data.leaderboard is undefined`
- [x] AmbientManager ReferenceError on undefined previousMode
  - **Modified:** `apps/web/components/AmbientManager.tsx` - Replaced unsafe `previousMode` reference with safe fallback
  - **Result:** No more `ReferenceError: previousMode is not defined`

### Changes
**1. Line 125 fix (leaderboard/page.tsx):**
```typescript
// Before:
if (!data || data.leaderboard.length === 0) {

// After:
if (!data || !data.leaderboard || data.leaderboard.length === 0) {
```

**2. AmbientManager.tsx fix:**
```tsx
// Before:
initial={previousMode ? { opacity: 1 } : false}

// After:
initial={{ opacity: 0 }}
```

---

## [0.35.4] - "Unified Footer Design + NextAuth Port Fix"

### Goal
Clean up footer UI by merging version display and dev overlay into one consistent bottom-left element, plus fix NextAuth port mismatch causing login JSON.parse errors.

### Fixed
- [x] Footer now shows unified single-line design
  - **Modified:** `apps/web/app/components/Footer.tsx` - Unified version + dev mode display
  - **Result:** Single line "Version: 0.35.4 � DEV MODE (check console)" positioned bottom-left with clean blue-on-white styling
- [x] NextAuth port mismatch resolved
  - **Modified:** `apps/web/.env` - Updated `NEXTAUTH_URL` from port 3000 ? 3001
  - **Modified:** `apps/web/next.config.js` - Added env variable pass-through for NEXTAUTH_URL
  - **Result:** Login now returns proper JSON response, no more 500 errors

### Changes
**1. Footer Redesign:**
- Removed centered layout, switched to fixed bottom-left positioning
- Merged dev mode info into single line with " � DEV MODE (check console)" suffix
- Applied clean color scheme: blue text on semi-transparent white background
- Small font size (12px) with subtle hover opacity effect
- Removed extra overlays and yellow bars for cleaner UI

**2. NextAuth Configuration:**
- Fixed `.env` file to use correct port 3001 for `NEXTAUTH_URL`
- Added environment variable pass-through in `next.config.js`
- Ensures NextAuth callbacks return JSON instead of HTML error pages

---

## [0.35.4-fixing_everything] - "Dev Port 3001 Lock + Auto NEXTAUTH_URL"

### Goal
Enforce development server to always run on port 3001 and auto-configure NEXTAUTH_URL dynamically to prevent auth/port conflicts in monorepo structure.

### Fixed
- [x] Dev server now enforces port 3001 with monorepo support
  - **Created:** `scripts/dev-port-guard.js` - Port guard script with monorepo path resolution
  - **Modified:** `package.json` - Updated "dev" script to use port guard
  - **Modified:** `.env` - Updated port from 3000 to 3001 for all related variables
  - **Result:** Startup aborts if port 3001 is taken; NEXTAUTH_URL auto-matches port; correctly launches from apps/web

### Changes
**1. Port Guard Script (v2 - Monorepo-aware):**
- Validates `apps/web` directory exists before starting
- Changes to `apps/web` directory before launching Next.js
- Checks if port 3001 (or NEXT_PUBLIC_PORT) is available before starting
- Auto-sets `PORT` and `NEXTAUTH_URL` environment variables dynamically
- Aborts with clear error message if port is already in use or directory is missing
- Launches Next.js dev server with inherited stdio for clean output

**2. Updated Dev Script:**
- Root `package.json` "dev" script now runs port guard instead of direct concurrently
- Ensures consistent port usage across all dev sessions
- Works correctly in monorepo structure by navigating to apps/web

**3. Environment Variables Updated:**
- `NEXTAUTH_URL` changed from `http://localhost:3000` ? `http://localhost:3001`
- `NEXT_PUBLIC_APP_URL` changed from `http://localhost:3000` ? `http://localhost:3001`
- Added `NEXT_PUBLIC_PORT=3001`

---


## [0.35.3-navfix] - "Fixed Navigation Overlap on Landing/Auth Pages"
### Goal
Fix the visual bug where the global navigation bar was overlapping with page-specific headers on landing, login, and signup pages.

### Fixed
- [x] Global navigation no longer renders on pages with custom headers
  - **Created:** `apps/web/components/ConditionalNav.tsx` - Conditional navigation wrapper
  - **Modified:** `apps/web/app/layout.tsx` - Uses ConditionalNav instead of always rendering nav
  - **Result:** No more overlapping headers on landing/auth pages

### Changes
**1. New ConditionalNav Component:**
- Client component that checks current pathname using `usePathname()`
- Conditionally hides global nav on pages with their own headers: `/landing`, `/login`, `/signup`, `/waitlist`, `/onboarding`, `/`
- Maintains normal navigation on all other pages (main, profile, flow-demo, friends, etc.)

**2. Updated Root Layout:**
- Replaced inline nav rendering with `<ConditionalNav />` component
- Added import for the new ConditionalNav component
- Cleaner layout structure with better separation of concerns

### Visual Impact
- Landing page: Fixed header no longer overlaps with global navigation
- Login/Signup pages: Clean single header without duplication
- Main app pages: Global navigation continues to work as expected

---
## [0.35.2-authfix] – "Next-Auth Client/Server Provider Split"




