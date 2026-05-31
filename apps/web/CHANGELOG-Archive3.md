
<<<<<<< HEAD

## [0.51.01] - 2026-05-30

### Added
  - **Question Source of Truth architecture:** `Question` is the canonical import/catalog table; `FlowQuestion` remains the runtime model for `/api/flow/*`.
  - **Taxonomy external IDs:** `Category.externalCId`, `SubCategory.externalScId`, `SubSubCategory.externalSscId`, `SssCategory.externalSssId` with scoped unique constraints for safe upsert during import.
  - **Question lifecycle + import fields:** lifecycle status (`DRAFT` → `REJECTED`), response type, sensitivity, quality, source row metadata, and lifecycle timestamps on `Question`.
  - **`QuestionStats` model:** materialized `usageCount` / `answerCount` / `reportCount` separated from import truth.
  - **`FlowQuestion.sourceQuestionId`:** nullable FK linking projected flow questions back to canonical `Question` records.
  - **Import + projection services:** `importSourceQuestions()` upserts taxonomy + questions from JSON/CSV rows; `syncPublishedQuestionsToFlow()` projects `PUBLISHED` questions into active `FlowQuestion` rows (deactivates on non-published/archived).
  - **Admin API:** `POST /api/admin/questions` with `import`, `sync`, `import-and-sync`, and `counts` actions.
  - **CLI script:** `packages/db/scripts/question-import-sync.ts` for local import/sync operations.

### Migration
  - `20260530120000_question_source_of_truth` — additive schema only; no data drops.

## [0.50.49] - 2026-05-06

### Changed
  - **Admin seeding UX status clarity:** `Run Full Seed` now has explicit local run-state UX with immediate disable + spinner (`Seeding…`) to prevent double-trigger clicks and make in-progress state visible.
  - **Compact seed status messaging:** Admin seeding now shows clear state text near the button for running/success/error (`running`, `Seed completed. Refreshing data…`, `Seed failed: ...`) based on actual API outcome handling (`success: true|false`, non-2xx, and network errors).
  - **Post-seed data refresh:** On successful seed completion, admin dashboard now reloads relevant data (`audit logs` + `visit stats`) automatically so the operator sees updated state without blind refresh.
  - **Action log integration:** Seed start and completion/failure lines are appended to the existing Action Log with minimal noise.

## [0.50.48] - 2026-05-06

### Fixed
  - **Shop placeholder takeover:** Removed the `/shop` full-page placeholder return path that could replace shop UI in admin/empty states. Empty catalog now renders as an inline empty-state message inside the existing shop panel, keeping the page testable.
  - **Coins vs Gold display consistency (high-visibility):** Updated legacy wallet balance wiring to prefer `funds` (Coins) with safe fallback to `gold`, preventing contradictory visible balances across surfaces using shared wallet hooks.
  - **Currency naming normalization on key surfaces:** Wallet bar now presents soft currency as `Coins`, and Flow reward labels now use `Coins`/`Diamonds` naming for user-facing consistency.

## [0.50.47] - 2026-05-06

### Changed
  - **Flow Complete share placeholder flow (practical):** Share actions now build a safe share payload with insight lines, optional archetype label for authenticated users, `PareL` branding, and a share URL (`/r/[shareId]` when available, otherwise `/flow-demo`).
  - **Share preview transparency:** Added a `Share preview` block in Flow Complete share sections showing the exact text + link users are about to share/copy.
  - **Share action behavior refinement:** `Share result` uses native share (`title`/`text`/`url`) when available and falls back to copying payload; `Copy link` now always works (public link for authenticated users when available, `/flow-demo` for guests/fallback), and `Copy text` copies text-only payload.
  - **Guest-safe sharing path:** Guests never call the authenticated snapshot API, can still share/copy safely with `/flow-demo`, and see a note that account creation is needed for a personal public result link.

## [0.50.46] - 2026-05-06

### Changed
  - **Onboarding visual cohesion (palette-only):** Updated `/onboarding` and onboarding step surfaces to use the existing dark PareL app palette (`bg-bg`, `bg-card`, `border-border`, `text-text`, `text-subtle`) instead of legacy light gradients/white cards.
  - **Onboarding controls styling alignment:** Unified onboarding option cards, navigation buttons, progress bar, and loading state to current app token styles with clear selected/hover contrast and preserved focus readability.
  - **No behavior changes:** Onboarding step order, submit/skip API calls, completion/redirect logic, and feature scope remain unchanged.

## [0.50.45] - 2026-05-06

### Fixed
  - **Signup duplicate-email clarity:** `/api/signup` now returns a safe explicit duplicate-account error (`An account with this email already exists. Log in instead.`) with `ACCOUNT_EXISTS` code, replacing ambiguous generic failures for this case.
  - **Signup error UX:** `signup` page now surfaces safe backend error text when available, maps duplicate-email responses to a clear message, and shows a visible `Log in` recovery link.
  - **Login-link context preservation:** Duplicate-email recovery link preserves relevant query context (`next` and `from=demo-result`) so users keep intended post-login routing.

## [0.50.44] - 2026-05-06

### Fixed
  - **Archetype badge guest confusion:** Flow Complete no longer renders the archetype badge for unauthenticated/demo users, removing ambiguous fallback labels from guest results.
  - **Archetype context hint for authenticated users:** Logged-in users still see the archetype badge, now with a hover/focus hint (`title` + keyboard focus) clarifying it is an early placeholder label based on answer patterns.

## [0.50.43] - 2026-05-06

### Fixed
  - **Guest promoted-flow guard in Flow Complete:** Clicking `Start this flow` in the temptation module as a guest no longer silently restarts the generic demo flow. Guests now get a clear unlock stopper with `Create account` (`/signup?from=demo-result`) and `Back to result`.
  - **Promoted-flow context clarity:** The stopper keeps promoted-flow context visible (title + mood label), so users understand what they tried to open (e.g. Wildcard/featured continuation).
  - **Temptation start failure clarity:** If promoted flow start fails, users now get an explicit in-place stopper with retry/back actions instead of an ambiguous path.

## [0.50.42] - 2026-05-06

### Fixed
  - **Flow Complete share feedback scope:** Share-action button feedback is now action-specific in `/flow-demo` result actions. Clicking `Share result`, `Copy text`, or `Copy public link` only updates the clicked button label (instead of updating multiple buttons at once).
  - **Feedback timeout behavior preserved:** Action-specific feedback still auto-resets after the existing short timeout windows, and native share / clipboard fallback behavior remains unchanged.

## [0.50.41] - 2026-05-06

### Changed
  - **Focused Result Flow polish (lightweight):** Tightened Flow Complete hierarchy so continuation is dominant: the recommendation module now appears directly in the primary result stack on all breakpoints while utility actions are visually secondary.
  - **Premium next-flow tease presentation:** Upgraded `FlowTemptationCard` into a compact “next quest” reveal with highlighted path badges, deterministic faux-random rarity emphasis, and a collapsible first-question teaser (presentation-only, no backend randomness or economy logic).
  - **Utility de-emphasis and CTA clarity:** Reworked result utility controls into collapsed “Share and save options” sections with calmer styling and reduced button overflow risk; added explicit helper copy to clarify the main next step.
  - **Palette/card hierarchy cleanup:** Reduced overly dominant blue glow treatment in share/result cards and normalized secondary/passive card borders/background intensity for a less dashboard-like feel.

## [0.50.40] - 2026-05-06

### Changed
  - **P9.2 top-journey smoke patch (surgical):** Updated `/flow-demo` category Back behavior to be context-safe: unauthenticated users now return to `/landing`, authenticated users return to `/main`.
  - **Guest-safe public sharing path:** In `/flow-demo` result actions, guests no longer see a broken `Copy public link` action (which requires auth). Guests now see `Create account to share publicly` routed to `/signup?from=demo-result`; authenticated users keep `Copy public link`.
  - **Signup clarity:** Updated signup field label from `Username` to `Email` (payload unchanged) and added helper copy clarifying the current journey: `Log in once and we'll start your onboarding flow.`
  - **Top-funnel auth wording:** Landing header auth CTA now uses canonical `Log in`.
  - **P9.1 critical cohesion patch (surgical):** Fixed mobile flow navigation target from `/flow` to canonical `/flow-demo` and aligned top-level route/nav naming for `/main` as **Dashboard** and `/flow-demo` as **Flow** (no route renames).
  - **Economy wording consistency (UI-only):** Normalized key shop-facing labels to **Coins**/**Diamonds** in `ShopHeader`, `CurrencyPackCard`, and core shop messaging (kept backend/hook field names untouched).
  - **Auth wording consistency:** Normalized key auth copy to **Log in** / **Create account** variants on login/signup/nav user-facing labels.
  - **Dashboard wording consistency:** Replaced visible **Back to Main** style CTAs in core flow reward/completion surfaces with **Go to dashboard**.
  - **Removed visible placeholder/dev copy:** Replaced user-facing challenge placeholder text and admin/internal “reseed” style shop fallback copy with product-grade messaging.

## [0.50.38] - 2026-05-06

### Added
  - **Public result snapshot route:** Added `/r/[shareId]` as a lightweight public result page for shared flow outcomes (emotional hook, archetype, teaser insight, subtle social hint, and conversion CTAs) without exposing raw answers or user identity.
  - **Flow share snapshot API:** Added `POST /api/flow/share-result` to create a minimal immutable snapshot in existing `share_cards` storage (`type: flow_result`) with 14-day expiry and strict safe fields only.
  - **Public metadata for sharing:** Public snapshot pages now generate contextual page metadata/OpenGraph text from the snapshot with safe fallbacks.

### Changed
  - **Flow Complete share actions:** Added `Copy public link` action in `flow-demo` result states; it lazily creates a snapshot via the new API and copies `/r/[shareId]` link for sharing.
  - **Reuse-first architecture:** Reused existing insight/archetype/share/mood/ambient logic from flow result UI and existing share-card persistence, avoiding a duplicate result pipeline or profile-publication system.
  - **P7 ambient social layer (lightweight, no realtime rebuild):** Added `apps/web/lib/ambientSocial.ts` as a small UI-safe signal resolver for subtle social-proof copy (`flowActivity`, `hesitation`, `continuation`, `wildcard`, `comparison`) with fallback-first behavior and no personal-answer exposure.
  - **Flow Entry Hook Cards ambient signal:** `flow-demo` category hook cards now show a muted ambient line (e.g. people are answering this topic) derived from centralized ambient helper logic, keeping hook question as primary and metadata/reward secondary.
  - **Checkpoint ambient signal:** Added subtle social continuation/hesitation line under checkpoint copy, with mood-aware variants (deep/funny/spicy/etc.) resolved through ambient helper.
  - **Flow Complete / Temptation ambient signal:** `FlowTemptationCard` now supports an optional ambient line and `flow-demo` populates it from ambient helper using available flow-result aggregate counts when present, otherwise safe soft wording fallback.
  - **Content layer integration:** Added ambient social content keys and registry defaults in `flowContent.ts` + `contentRegistry.ts`, so copy variants remain centralized and fallback-safe instead of scattering literals across components.
  - **P6 mood source of truth (static + typed):** Expanded `apps/web/lib/flowTopics.ts` into a centralized typed mood config (`FlowMoodKey`, intensity, audience safety, label/subtitle/visual class) and added deterministic `getContrastingMood(...)` for lightweight emotional routing.
  - **Flow Temptation now consumes centralized mood contrast:** `flow-demo` next-flow selection now derives current and candidate moods from `flowTopics` profiles, prefers contrasting moods via `getContrastingMood(...)`, and keeps existing deterministic fallback behavior without changing flow choices APIs or schema.
  - **Flow Entry Hook Cards mood consistency:** Entry cards now show mood label from centralized mood profiles while keeping first-question preview dominant and category/reward secondary (`Category · Mood · +X coins`).
  - **Checkpoint mood-aware copy (lightweight):** Added a small local resolver to vary checkpoint body/curiosity copy by mood (deep, funny/light, spicy, comfort/social) with safe fallback to existing content keys.
  - **Conservative spicy/adult gating retained:** Recommendation filtering remains conservative using existing heuristics plus `safeForGeneralAudience`; added TODO to replace heuristics with explicit content metadata in a future phase.
  - **Flow entry cards shifted to hook-first:** Reworked `/flow-demo` category selection cards into curiosity-driven flow hooks where the first-question teaser is the primary visual element, while category/mood/reward are secondary metadata.
  - **Reused existing first-question systems:** Flow hook teasers now pull from existing category question sources (`/api/flow/[categoryId]/next` for authenticated users and existing demo-ghost first question for client-only fallback categories), with curated deterministic fallback question copy when no teaser is available.
  - **Lightweight tone + reward metadata:** Added lightweight mood labels derived from existing category naming/mood signals and a muted reward preview line (`Category · Mood · +X coins`) so reward stays informative without dominating card hierarchy.
  - **No architecture changes:** Kept existing flow start/choice/reward systems intact and only updated presentation/selection UX in the category-entry layer.
  - **Flow Complete temptation loop (no engine rewrite):** Added a new `Recommended Next Flow` module to `/flow-demo` result states that reuses existing flow choices/categories and appears in desktop sidebar (right column) while also rendering between share and reward on mobile.
  - **Deterministic next-flow selection:** Reused existing `getFlowChoices` + topic mood metadata to pick a contrasting next category, with wildcard-first bias, simple tone-contrast rules, and safe adult/spicy gating via existing age-group context (`mature` only).
  - **Question hook + fallback safety:** Reused existing `/api/flow/question` for first-question teaser preview, with graceful fallback copy and a curated static wildcard fallback card when no recommendation candidate is available.
  - **Low-risk UI addition:** Introduced `components/flow/FlowTemptationCard.tsx` for visual differentiation using existing mood classes/background styles and a direct `Start this flow` CTA wired into the current flow-start path.
  - **Onboarding routing cleanup (single source of truth):** Standardized post-auth routing around `User.onboardingCompleted` (via `/api/onboarding/start`) without introducing a second onboarding system.
  - **Login/signup redirect consistency:** Credentials login and already-authenticated visits to `/login`/`/signup` now route to `/onboarding` when onboarding is incomplete, otherwise `/main` (no more `/landing` redirects). Signup success now follows existing safe auth behavior by redirecting to `/login?next=/onboarding`.
  - **Social login post-auth guard:** Social providers now callback to `/post-login`, which resolves onboarding status and redirects to `/onboarding` or `/main` without breaking provider sign-in.
  - **Stale onboarding exit removed:** Replaced legacy `/daily` onboarding completion redirects with `/main` in both onboarding page and onboarding flow fallback.
  - **Email verification policy unchanged:** Added TODO note for future verified-email reward while keeping verification optional for login/onboarding access.
  - **Age-aware tone groundwork (no schema/auth changes):** Audited existing profile/onboarding demographics and reused current onboarding source (`/api/onboarding/start` -> `ageGroup`) instead of adding new fields/flows.
  - **New helper:** Added `apps/web/lib/flow/getAgeGroup.ts` to normalize age context for UI tone (`young` / `mid` / `mature` / `unknown`) using existing onboarding `ageGroup` first, with optional birth-year/date derivation and safe unknown fallback.
  - **Flow Complete + Share tone input:** `flow-demo` result/share variant selection now accepts normalized `ageGroup` and includes it in deterministic seed selection; missing age safely falls back to `unknown` without changing backend contracts.
  - **Flow Complete share-first hierarchy:** Promoted sharing to the primary UX path by placing Share directly after Insight + Archetype with stronger visual weight and dedicated action row before remaining result blocks.
  - **Share CTA upgrade:** Replaced secondary copy-first controls with primary **Share your result** action and secondary **Copy text** action. Primary behavior: uses `navigator.share` when available, otherwise falls back to clipboard copy; inline feedback now shows `Shared` / `Copied` / copy failure.
  - **Share emphasis polish:** `FlowShareCard` is now larger and higher-contrast (still theme-safe), and includes a subtle social nudge line to encourage sharing without adding clutter.
  - **Flow Complete shareability:** Added `FlowShareCard` under Insight/Archetype in Flow Complete result states with a compact screenshot-friendly layout (two-line punchline + subtle PareL branding).
  - **Deterministic share text:** Share copy now derives from similarity buckets (`high`/`mid`/`low` + fallback) using seeded deterministic variant selection (no random flicker), then appends `Try it: parel.app`.
  - **One-click share actions:** Added `Copy result` (clipboard + inline copied feedback) and conditional native `Share` button (`navigator.share` only when supported). No usernames, stats, or sensitive values included in share text.
  - **Flow Complete identity + trust layer:** Added `FlowArchetypeBadge` under Insight with deterministic buckets from similarity (`>65` aligned, `<40` outlier, otherwise balanced; fallback explorer) and added a muted trust note at result footer via `flow.result.trustNote`.
  - **Deterministic insight variants:** Extended flow content keys/registry with high/mid/low insight variants (`flow.result.insight.*`) and selected variant deterministically from a stable result seed (category + counts + xp + row count), with fallback to existing default insight keys.
  - **Parallels + reward micro-variation:** Parallel card title now uses deterministic phrase variants (`flow.result.parallel.title.*`) with `{name}` interpolation; reward line now uses deterministic templates (`flow.result.reward.*`) with `{amount}` interpolation.
  - **Signup visual refresh:** Restyled `/signup` to match current dark auth layout (`dark:bg-gray-900` shell + dark card/input/text states) and removed legacy white-panel styling so demo-result handoff feels native to the app.
  - **Demo handoff copy kept with safe fallback:** `/signup` continues to show contextual title/body only for `from=demo-result`; default signup copy remains for normal visits.
  - **Signup/login navigation loop:** Added bidirectional auth links with query preservation — `/signup?from=demo-result` links to `/login?from=demo-result`, and `/login?from=demo-result` links back to `/signup?from=demo-result`.
  - **Guest route label consistency:** Updated route label for `/signup` from `Sign Up` to `Create account` to keep wording consistent and avoid duplicate/confusing naming.

## [0.50.27] - 2026-05-05

### Fixed
  - **Signup/login demo-result handoff:** Fixed `ReferenceError: fromDemoResult is not defined` on `/signup?from=demo-result` by deriving `fromDemoResult` from `useSearchParams()` and `isFromDemoResultHandoff(...)` (same pattern as login). `/signup` without `from` now falls back to normal copy; `/signup?from=demo-result` and `/login?from=demo-result` both render contextual copy safely.

## [0.50.26] - 2026-05-05

### Added
  - **Content layer (Phase 1, static typed registry):** Added `apps/web/lib/content/contentTypes.ts`, `contentRegistry.ts`, `resolveContent.ts`, and `flowContent.ts` to centralize small product copy behind typed keys with safe fallback resolution.

### Changed
  - **Flow Complete + Checkpoint copy source:** Migrated hardcoded copy in `/flow-demo` result/checkpoint paths to `resolveContent(...)` keys (insight variants, parallels heading/subtitle, CTAs, reward label, checkpoint title/body/progress/curiosity/buttons).
  - **Parallels CTA copy source:** `Compare answers` now resolved through centralized content key (no behavior/layout changes).
  - **Flow Complete polish:** Reduced reward/stats prominence in `/flow-demo` result states — reward is now a lightweight inline line (*You earned +X coins/XP/diamonds*), and stats are a muted single line (*answered · skipped · XP*) instead of boxy metric cards.
  - **Parallels readability + immersion:** Added `formatDisplayName(user)` in `lib/flow/sanitizeDisplayValue.ts` (display-only anonymization for demo/placeholder names, e.g. `Player #abcd`), updated `ParallelCard` to use it, emphasized `% match`, and clamped biggest-difference text to 1–2 lines while still hiding invalid data.
  - **Microcopy cleanup:** `ParallelsSection` subtitle shortened to **Based on your answers** to reduce robotic/system phrasing.
  - **Currency naming (UI/API layer):** Unified soft-currency language to **Coins** in key player surfaces and shop flows while keeping storage fields unchanged (**`funds` / legacy gold semantics**). Updated dashboard stat label, shop copy/toasts, coin/profile shop helper copy, and shop purchase API validation/messages.
  - **Shop navigation fix:** Normalized shop entry points to **`/shop`** (profile hub + commerce card + diamond-shop return link), keeping nav consistency and removing dead/misaligned shop paths.
  - **`/shop` structure clarity:** Added explicit sections inside `/shop` — **Items Shop (Coins)** and **Premium Shop (Diamonds)** — with a direct link to `/diamondshop` and a concise currency-explainer footer.
  - **Flow checkpoint UX:** Replaced robotic checkpoint copy in **`/flow-demo`** with a human progress moment: title **“This is getting interesting.”**, description **“Your answers are starting to form a pattern.”**, simplified muted progress line (**“About halfway through this topic · +XP”**), and curiosity hook (**“Next questions get more personal.”**). Updated buttons to **Keep going** and **Switch topic** with unchanged behavior, and tightened checkpoint card spacing for cleaner hierarchy.
  - **Flow Complete desktop layout:** Result screens now use **`grid grid-cols-1 lg:grid-cols-2`** with a wider container (**`max-w-6xl`**). Left column keeps the immediate path (**Insight → Next Actions → Reward → Stats**); right column contains **People like you** parallels, so the primary CTA is visible above the fold on desktop while mobile remains stacked.
  - **CTA positioning:** Next action card sits directly under Insight with **Try another flow** as primary action. Secondary action is contextual: **Go to dashboard** (authenticated) or **Create account to save your results** (guest).
  - **Parallels length control:** **`ParallelsSection`** now limits visible cards to top 3 by default and reveals the rest via **Show more**, preventing long lists from pushing actions out of view.

  - **Flow Complete UX (P0 reorder):** **`/flow-demo`** result now follows **Insight → People like you → Next action → Reward → Stats** for starter and non-starter completions. Added deterministic insight copy based on parallels average similarity (fallback when unavailable), promoted parallels as the main block, added explicit next actions for guest vs authenticated users, demoted reward to a compact line card, and replaced large stat tiles with a muted single-line summary.
  - **Parallels presentation + data hygiene:** **`ParallelsSection`** now uses **People like you** prominence and reports average similarity upstream. **`ParallelCard`** now shows *You and {name} think alike*, *% match*, shared answers, and *Compare answers* CTA. Added **`sanitizeDisplayValue`** / **`sanitizeParallelName`** to hide gibberish/invalid disagreement text and map demo-like names (e.g. *Demo*, *User 1*) to **`Player #<shortId>`**.

## [0.50.20] - 2026-05-05

### Fixed
  - **Database / Prisma:** **`flow_questions.wikiFillCandidate`** (and siblings **`worldContextKey`**, **`worldContextRegionPolicy`**, **`worldContextLabel`**, **`tags`**, **`arcStep`**) were in **`schema.prisma`** but missing on databases where **`pnpm prisma:migrate:deploy`** only applied migrations under **`packages/db/migrations/`**—the wiki-field SQL had lived only under **`packages/db/prisma/migrations/`**, so it never ran (Prisma **P2022** on **`/api/flow/question`**). Added idempotent migration **`packages/db/migrations/20260505120000_flow_questions_columns_reconcile`**. After pull, run **`pnpm prisma:migrate:deploy`** with **`DATABASE_URL`** set, then **`pnpm exec prisma generate --schema=packages/db/schema.prisma`** if the client is regenerated locally.

## [0.50.19] - 2026-05-03

### Changed
  - **`QuestionInput` option UI:** **SINGLE_CHOICE** / **MULTI_CHOICE** options use full-width **card** rows (`border-border`, **`bg-card`**, padded, rounded, **`gap-3`** stack), **hover** (`bg-accent/10`, stronger border), **selected** (`bg-accent`, **`text-white`**, **`scale-[1.02]`**, light shadow). Entire row is a **`<label>`** (pointer, keyboard focus ring via **`focus-within:ring`** on the card). **MULTI_CHOICE** uses **`onCheckedChange`** (no **`tabIndex={-1}`**) so options stay keyboard-reachable. **RANGE** control sits in a matching bordered **`bg-card`** container; slider **`cursor-pointer`**. **`RadioGroupItem`** / **`Checkbox`** now merge **`className`** via **`cn`** for contrast on selected cards.
  - **`/flow-demo` question step:** Client-only / fallback flow no longer shows **between-question spinners** or **loading-derived disabled states** on answers (`loadNextQuestion` API path no longer toggles **`loading`**). **`questionSyncing`** + ref guard replace **`setLoading`** for **`/api/flow/answer`**, **`loadNextQuestion`**, checkpoint continue, and skip-suggestion continue—buttons disable without a spinner. **Guests:** **`loadChoices`** skips **`setLoading(true)`** to avoid a brief *Starting your flow…* flash.
  - **Instant advance:** **`QuestionInput`** **`onSelectForSubmit`** wired from **`flow-demo`**; **RANGE** uses Radix **`onValueCommit`** to submit on release. **Single-choice** (e.g. demo yes/no) advances on tap. **Submit** keeps a check icon (no spinner). **Active** **`scale`** feedback on Submit / Skip.
  - **Demo UX:** Removed success **toasts** for client-only **submit** and **skip** (no extra "waiting" chrome).

## [0.50.17] - 2026-05-03

### Added
  - **Guest demo → signup handoff:** **`lib/auth/demoResultHandoff.ts`** — **`from=demo-result`** query contract, **`signupHrefFromDemoResult()`**, **`isFromDemoResultHandoff`**. **`/flow-demo`** result primary CTA navigates to **`/signup?from=demo-result`**. **`/login`** and **`/signup`** read **`from`** and show contextual headline + body (*Save your comparison results* / unlock comparisons copy) only for that param; default copy unchanged otherwise.

## [0.50.16] - 2026-05-03

### Changed
  - **`lib/flow/demoResultCopy.ts`:** Each **`questionId` + `answerKey`** now maps to **`variants: DemoResultVariantRow[]`** ( **`DemoResultVariant`** + **`breakdownLine`**). One variant per completion is chosen with a **stable hash** of the user’s answer string (`makeDemoResultSeed`)—no `Math.random()`, no hydration surprises. **`DEMO_RESULT_FALLBACK_ENTRY`** includes multiple fallback variants. **`pickDemoResultVariantForAnswer`**, **`makeDemoResultSeed`** exported for tests/extensions.

## [0.50.15] - 2026-05-03

### Added
  - **`lib/flow/demoResultCopy.ts`:** Central table **`DEMO_RESULT_COPY_TABLE`** (`questionId`, **`answerKey`**, **`verdict`**, **`statLine`**, **`personalityLine`**, plus **`breakdownLine`** for quick-read bullets), **`DEMO_RESULT_COPY_FALLBACK`**, **`DEMO_RESULT_SHARED`** (subtitle, stat body, disclaimer, section title). **`resolveGuestDemoResultCopy`** drives guest client-only **`/flow-demo`** result UI—no result copy hardcoded in the page.

### Changed
  - **`demoGhostFallback`:** Removed **`getGuestDemoBreakdownLines`**, **`getPersonalityLine`**, **`getDemoResultPersonalityLine`**, **`DEMO_PERSONALITY_FALLBACK`** (replaced by **`demoResultCopy`**).

## [0.50.14] - 2026-05-03

### Added
  - **Demo result personality line:** **`getPersonalityLine`** + **`getDemoResultPersonalityLine`** in **`lib/flow/demoGhostFallback.ts`** (answer-aware copy for **ghost** / **screen** / **job**, with **`DEMO_PERSONALITY_FALLBACK`**). Guest client-only **`/flow-demo`** result shows one muted line under the comparison card (not a headline). No backend.

## [0.50.13] - 2026-05-03

### Changed
  - **`/flow-demo` client-only result (guests):** Bottom actions reduced to **two** centered controls — **Create account to save your results** → **`/signup`**, and **Try another question** (restarts demo via existing reset). Removed **`LockedFeatureTeaserCard`** from this screen. Softer outline styling on the secondary action; extra spacing and **`max-w-md`** alignment. **Signed-in** users finishing the same path get **Continue to app** → **`/main`** plus **Try another question** (no duplicate signup CTA). Deleted unused **`LockedFeatureTeaserCard.tsx`**.

## [0.50.12] - 2026-05-03

### Added
  - **First-question micro-hint:** **`components/flow/FlowFirstQuestionHint.tsx`** — static, muted line (*No right answers. Just pick what feels true.*) shown **only** before the first answer or skip: **`/flow-demo`** (`answeredCount === 0 && skippedCount === 0`) and **`/flow/[categoryId]`** (until first successful submit or skip). No animations on the hint.
  - **`LockedFeatureTeaserCard`:** Static guest-only teaser (dashed/dimmed card, lock icon) on **`/flow-demo`** client-only **result** step — *Unlock deeper comparisons at Level 5* + body copy, **Create account to start leveling** → **`/signup`**, **Continue demo** (same reset as *Try another flow*). Shown only when **`useSession`** is **`unauthenticated`** (no nav changes, no backend).

## [0.50.10] - 2026-05-03

### Changed
  - **Guest global navigation (`md+`):** **`NavLinks`** for **`unauthenticated`** users now shows only **`APP_NAME`** (link to **`/landing`**), **FAQ** / **About**, **Login**, and primary CTA *Find out if you're normal* → **`/flow-demo`**. Removed **Home**, **Try demo**, **Create account**, and the **Info** dropdown. **`AuthStatus`** no longer duplicates login/signup for guests (language selector only). **`ConditionalNav`** wraps **`NavLinks`** in **`min-w-0 flex-1`** for safer wrapping. Signed-in **`NavLinks`** unchanged.
  - **`/flow-demo` guest (client-only) result:** Replaced row/table-style report with three stacked cards—verdict (*You’re suspiciously average.* / *Not boring. Statistically efficient.*), comparison (*68% answered close to you* + signup upsell), and *Your quick read* bullets from **`getGuestDemoBreakdownLines`** (answer-aware ghost / screen-time / work lines). CTAs: **Create account to save your results** (primary) and **Try another flow** (secondary). Footer disclaimer only: *Demo results use illustrative comparison data.* **`DemoGhostReportRow`** includes optional **`questionId`** for breakdown mapping.
  - **`/landing` flow CTAs:** Primary *Find out if you're normal* buttons (top nav, hero, bottom card) now set **`flowNavigateBusyId`** before **`router.push`**, disable all primary flow controls while navigating, show a left **`Loader2`** + *Loading your first question...*, and set **`aria-busy` / `disabled`** on the active control. **`LandingPromoCard`:** internal **`/flow-demo`** links use a full-card **`<button>`** when **`onFlowDemoNavigate`** is passed (hero, below-hero, footer promos) for the same instant feedback without **`Link`** prefetch-only behavior. **`lib/landing/landingPromos`:** **`isFlowDemoHref`**.

## [0.50.07] - 2026-05-03

### Fixed
  - **`/flow-demo` guest / fallback flow:** **`POST /api/flow/start`** requires sign-in, but anonymous users still received DB topic cards and hit the API on *Start* → generic *Failed to start flow*. **Guests** now only get the client-only **Quick questions** ghost (`isFallback: true`); **`loadChoices`** waits for **`useSession`** and skips the choices API when unauthenticated. **Signed-in** users unchanged (real **`/api/flow/start`**, **`/api/flow/answer`**, etc.). **`lib/flow/demoGhostFallback`:** **`isClientOnlyDemoCategory`**, **`DEMO_CLIENT_FALLBACK_ID_PREFIX`** (`fallback:*`) alongside **`demo-ghost-flow-local`**.

## [0.50.06] - 2026-05-03

### Added
  - **Admin-only access (frontend + route guard):** **`lib/auth/isAdmin.ts`** — **`ADMIN`** role check (case-insensitive, null-safe). **`components/auth/AdminGuard.tsx`** — client fallback (*Restricted area* / *Back to home* → **`/main`**) + **`console.warn`** on unauthorized client render.

### Changed
  - **`app/admin/layout.tsx`** and **`app/reports/layout.tsx`** — **`await requireAdmin()`** so all admin and app reports routes are blocked server-side for non-admins (redirect **`/login`** or **`/main`**). **`lib/authGuard` `requireAdmin`** logs **`[requireAdmin] Unauthorized admin access attempt`** with email before redirect.
  - **`NavLinks`** / **`AuthStatus`** — admin tools and quick links only when **`isAdmin(...)`**; removed unused nav **`userRole`**; **`AuthStatus`** still merges **`/api/me`** role with session for admin links when JWT lags DB.

## [0.50.05] - 2026-05-03

### Added
  - **Guest access guard (soft gating):** **`middleware.ts`** uses **`next-auth/jwt` `getToken`** + **`lib/guest/publicPaths.ts`**. Unauthenticated requests to non-public routes redirect to **`/landing?blocked=1`**. **`GuestBlockedModal`** ( **`components/auth/GuestBlockedModal.tsx`** ) on **`/landing`** explains with *Create an account to continue* / *Back to demo*. Public paths include **`/landing`**, **`/flow-demo`**, **`/login`**, **`/signup`**, **`/register`**, marketing/legal (**`/faq`**, **`/pricing`**, **`/about`**, **`/changelog`**, **`/info/*`**, **`/waitlist`**), **`/`**, **`/maintenance`**, all **`/api/**`**, and static assets.

### Fixed
  - **`/landing` GuestBlockedModal:** Restored missing **`import`** for **`GuestBlockedModal`**; component lives at **`components/auth/GuestBlockedModal.tsx`**. When **`blocked=1`** is absent, the modal returns **`null`** (no dialog mount).

### Changed
  - **`NavLinks`:** Guests see **Home / Try demo / Log in / Create account** + **Info** only (no Social, Profile, Shop, Arena, Community, Admin). **`AuthStatus`:** Guests get **Log in** + **Create account** instead of “Not logged in”. **`ConditionalNav`:** **`/flow-demo`** uses full-bleed demo (no global nav). **`Footer`:** Removed dev-only “DEV MODE” and refresh control. **`DevBar`**, **`EnvBadge`**, **`DebugPanel`:** No-ops (no dev strip / corner badges / debug panel).

## [0.50.04] - 2026-05-03

### Added
  - **`/flow-demo` client fallback (“ghost”) flow:** When **`GET /api/flow/choices`** returns no categories or fails, the demo injects a built-in **Quick questions** starter (ghost yes/no → screen **RANGE** → job **MULTI_CHOICE**) via **`lib/flow/demoGhostFallback.ts`**. Same **QuestionInput** path as DB flows—no admin/seed messaging. Finishes with comparison-style report rows + **Create account to save your results** → **`/signup`**. Removed public **“No flows available”** / **Admin Seeds** copy.

## [0.50.03] - 2026-05-03

### Removed
  - **Obsolete beta top banner:** Removed **`StagingBanner`** from **`app/layout.tsx`** and deleted **`components/StagingBanner`**. The fixed gradient strip (*PareL Beta v0.13.2k* / *Public Beta*) no longer appears on **`/login`** or other routes. **`BetaInfoModal`** header copy updated (*About PareL* + **`APP_VERSION`** from config); **`layout`** metadata **`generator`** no longer references an old **v0.13.2p** string.

## [0.50.02] - 2026-05-03

### Added
  - **Landing Promo Slots v1 (frontend-only):** **`lib/landing/landingPromos.ts`** — **`LandingPromo`**, **`getPromoForSlot`** (per-slot fallback, never throws), **`getPromosForSlot`** (active, optional **`startsAt` / `endsAt`**, priority desc, optional limit). **`LandingPromoCard`**: optional image strip, whole-card **`ctaHref`** via **`next/link`** (internal) or **`<a target="_blank" rel="noreferrer">`** (external). **`/landing`**: **`hero-right`** (~40% desktop / stacked mobile), **`below-hero`** row (≤3 cards), footer (≤2 compact). Placeholder routes **`/faq`**, **`/pricing`**, **`/about`**. Supersedes **`heroPromos`** / **`HeroPromoCard`**.

### Changed
  - **`/landing` primary CTAs:** Hero (guest + signed-in), top nav (guest + signed-in), and bottom CTA card now use **`/flow-demo`** with label *Find out if you're normal*. **Login** / **Open dashboard** / nav **Dashboard** stay secondary. **`hero-right`** promo + slot fallback **`ctaHref`** updated from **`/login`** / **`/signup`** to **`/flow-demo`** (matching CTA label).
  - **`/landing` hero (above the fold):** New positioning for first-time visitors: headline *Compare your life with strangers.* / *For science. Mostly.*, subheadline + four example question cards (replacing XP/leaderboard mock), primary CTA **Try it now** (`/signup`), log-in link, tagline *No productivity cult. No fake wisdom. Just honest comparisons.* Logged-in users see the same product framing + **Continue to the app**. Removed hero email/waitlist row and side-column stats mock.

### Fixed
  - **`packages/db` — `ensureDatabaseUrl` vs `next build`:** With **`APP_ENV=dev`** and no **`DATABASE_URL_DEV`**, the side-effect import of **`resolveDatabaseUrl`** threw during **`next build`** page-data collection. During **`NEXT_PHASE === "phase-production-build"`** or **`npm_lifecycle_event === "build"`**, missing **`DATABASE_URL_DEV`** / **`DATABASE_URL_PROD`** logs a **`console.warn`** and skips setting **`DATABASE_URL`**; **`next dev`** / **`next start`** unchanged (still **`Fatal`** if unresolved).
  - **Vercel / `@parel/redis`:** **`@parel/redis` was not listed in `apps/web` dependencies** (only a webpack alias existed). Added **`"@parel/redis": "workspace:*"`**. **`main` / `types`** on the package point at **`dist/`**; **`pnpm run build`** now also runs **`pnpm --filter @parel/redis run build`** before **`next build`** (after **`@parel/core`**), still no **`pnpm -r`** / full monorepo build.
  - **`CHANGELOG.md` merge conflict:** Removed stray Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and ordered sections so `[0.49.xx]` entries appear above `[0.47.xx]`.
  - **`apps/web/package.json` — `typecheck`:** Uses `node ../../node_modules/typescript/bin/tsc --noEmit` so `pnpm run typecheck` resolves TypeScript when hoisted to the monorepo root (pnpm), matching the existing `build` / `lint` script paths.

### Notes
  - **Production build:** `pnpm run build` from `apps/web` runs **`@parel/core`** then **`@parel/redis`** prebuild, then **`next build`**. Locally the build completes with a fresh **`.next`**; **`APP_ENV=dev`** without **`DATABASE_URL_DEV`** no longer aborts page-data collection (see **`ensureDatabaseUrl`** guard in **`packages/db/src/resolveDatabaseUrl.ts`**). You can unset shell **`DATABASE_URL*`** to exercise the build-time warn path. **`/landing`** remains in the route manifest for smoke checks.

## [0.49.05] - 2026-03-31

### Fixed (Vercel / `@parel/core` resolution)
  - **`apps/web` build:** `pnpm run build` runs **`pnpm --filter @parel/core run build`** before **`next build`** so **`packages/core/dist`** exists when the installer only builds the web app root. **`@parel/core`** and **`@parel/core/hooks/useEventBus`** (and other `exports`) resolve through compiled output; **`next.config.js`** **`@parel/core/config`** → **`dist/config`** unchanged. Scoped to **`@parel/core`** only—not a recursive monorepo build.

### Changed (deploy config alignment)
  - **Vercel Root Directory = `apps/web`:** Removed **repo-root** `vercel.json` (it pinned `buildCommand` / `installCommand` to `build:light` / `install:light`, `outputDirectory: apps/web/.next`, and `rewrites` to `/apps/web/$1`, which conflict with dashboard defaults when the project root is `apps/web`). Added **`apps/web/vercel.json`** with **`framework`**, **`regions`**, **`env` / `build.env`**, **`headers`**, **`redirects`** only—no `buildCommand`, `installCommand`, `outputDirectory`, `devCommand`, or path rewrites so **Build = `pnpm run build`**, **Install = `pnpm install --frozen-lockfile`**, and **output `.next`** stay dashboard-controlled.
  - **`apps/web/package.json`:** Set **`packageManager`** to **`pnpm@10.0.0`** (matches workspace root) so installs from the app directory use the intended pnpm version.

### Notes
  - **Redirect `/docs` → `/BETA_LAUNCH_v0.13.2k.md`:** The markdown file currently lives at the **monorepo root**, not under `apps/web/public`. If the redirect should serve that doc in production, add a copy (or symlink) under **`public/`** or change the destination.

## [0.49.04] - 2026-03-31

### Notes (deploy / build scope)
  - **Vercel light-build closure:** `packages/rating` and `packages/notifications` are **not** imported by `apps/web`; they appear because `apps/web` depends on `@parel/story`, and `packages/story/package.json` lists them even though current `story` **package exports** send most story APIs to **stubs** (real `src` that imports rating/notifications is not what Next resolves for those entry points). **`@parel/api`** is a direct `apps/web` dependency and is used across many API routes; it stays in the closure.

## [0.49.03] - 2026-03-31

### Fixed
  - **Build without `DATABASE_URL`:** `lib/env.ts` no longer calls `process.exit(1)` during `next build` when `NODE_ENV=production` and `DATABASE_URL` is unset (e.g. local/CI). Production guard now skips while Next sets **`NEXT_PHASE=phase-production-build`** (page-data workers) or **`npm_lifecycle_event=build`** (root script). Non-Vercel **`next start`** still requires real `process.env` values for `DATABASE_URL`, `STRIPE_SECRET_KEY`, and `REDIS_URL` (unless Redis disabled).

## [0.49.02] - 2026-04-02

### Added
  - **OpsRun debug (MVP):** `@parel/db` `OpsRun` helpers accept types **`SEED`** and **`API_ERROR`**; `createOpsRun` optional **`message`** on create. **`POST /api/admin/seed-db`** opens an OpsRun before `runSeedWorld`, **`finishOpsRun`** on success (`Seeder completed`) or failure (message + `errorStack`). **`GET /api/progression/stats`** and **`GET /api/admin/visits`** catch paths record **`API_ERROR`** via `createOpsRun` + **`finishOpsRun`** with `params.route`. **`/admin/ops`** client polls every **8s** (`quiet` refresh to avoid loading flicker); blurb updated. Detail page unchanged (message, collapsible stack, params JSON already present).
  - **User session trace (lightweight):** `apps/web/lib/logEvent.ts` — fire-and-forget `createOpsRun` + `finishOpsRun` (`success`). **Demo pipeline** (`flow_demo`): **`POST /api/flow/start`** → `flow_start`; **`GET /api/flow/question`** (no next) → `flow_complete`; **`POST /api/flow/answer`** → `question_answer` / `question_skip`; each includes **`params.channel`** = `flow_demo`. **Category route** (`/flow/[categoryId]`, `flow_category`): **`GET /api/flow/[categoryId]/next`** → `flow_start` when the user has no prior responses in that category, **`flow_complete` when there is no next question; **`POST .../answer`** and **`POST .../skip`** → `question_answer` / `question_skip`. **Legacy `FlowRunner`:** **`POST /api/flow-answers`** logs `question_answer` / `question_skip` with **`channel: legacy_flow_answers`** (including mock-question path). **Admin:** **`GET /api/admin/ops?userId=`** filters with Prisma JSON **`params.userId`** (latest 50 matches); ops UI debounces the User ID field. Trace rows also set **`params.userId`** for filtering.

### Fixed
  - **Flow category HTTP API:** `GET /api/flow/[categoryId]/next` called `getNextQuestionForUser` with **arguments reversed** (category id was passed as user id). **`POST /api/flow/[id]/answer`** invoked `answerQuestion` from `flowService` with **two string arguments** while that function expects a **`FlowAnswer`** object, so answers were not persisted correctly; the handler now uses **`recordFlowAnswer`** plus **`addXP`**, **`updateHeroStats`**, and **`publishEvent`** (aligned with **`POST /api/flow/answer`**) and returns basic stats in the JSON body.
  - **`/flow/[categoryId]` UI:** Uses shared **`QuestionInput`** (same behaviors as **`FlowRunner`**): **RANGE** is a **Radix `Slider`** (1–10, default 5); **NUMBER** / **`NUMERIC`** use a number field; **`MULTIPLE_CHOICE`** is normalized to **`MULTI_CHOICE`**. **Submit** sends JSON (`optionIds`, `textValue`, or `numericValue`). **`POST /api/flow/[id]/answer`** validates **RANGE** as an integer **1–10** and persists a clamped value.
  - **`/flow-demo`:** Question step refactored to the same **`QuestionInput`** + **`getInitialValue`** / **`isValidAnswer`** / **`toApiPayload`** helpers as category flow; inline radios/checkboxes/inputs removed. **RANGE** and **`NUMERIC`→NUMBER** behavior matches **`/flow/[categoryId]`**; failed submit surfaces API/toast error body when available.
  - **Notifications:** `NotificationBell` called `res.json()` on `apiFetch` (`safeApiFetch`), which returns `{ ok, data }` — not a `Response`. Load/open handlers now read the JSON body from `res.data`.
  - **`GET /api/events/today`:** Wrapped cache + Prisma path in `try/catch`; on any failure returns **200** with `{ success: true, event: null, region, timestamp }` so clients never depend on a failing DB/Redis for a valid empty payload.
  - **`GET /api/progression/stats`:** Wrapped handler in `try/catch`; on throw returns **200** with JSON matching the usual `successResponse` shape (`success`, `data` with null stats / safe defaults, `error: 'fallback'`, `timestamp`) so the client never receives non-JSON or hard failures that break `res.json()`.
  - **`GET /api/admin/visits`:** `try/catch` around stats queries with `NextResponse.json(visitsEmptyPayload)` on failure (all counters **0**, `ok: true`). Corrected 7d `Promise.all` destructuring (anonymous vs logged `groupBy`) and typo `loggedUsers7dGrouped` → `loggedUsersGrouped7d`, which could cause runtime failure before the catch.
  - **`POST /api/admin/seed-db`:** Single outer `try/catch` around session, admin check, env gate, and `runSeedWorld()`. On throw: **200** JSON `{ success: false, ok: false, error }` plus structured server log. Success payload includes `success: true` alongside existing `ok` / `message` / `stats`. Auth and production guard still return **401** / **403** with JSON.
  - **Admin logging / action log:** `POST` admin `trigger()` in `AdminDashboard` reads `apiFetch` failures and JSON `data.success === false` / `data.error` (and truncates long messages ~280 chars). Lines show `Fail — {error}` instead of a bare Fail. **`GET /api/admin/visits`** and **`GET /api/progression/stats`** catch blocks log `console.error('[API ERROR]', { route, error })` and return **200** JSON with `success: false` and truncated `error` where applicable; visits empty payload adds `success: false` + `ok: false` on error. **Seed-db** catch aligned to same `[API ERROR]` log pattern + truncated `error` in body.

## [0.49.01] - 2026-03-31

### Fixed
  - **@parel/story:** Duplicate `StoryVisibility` re-export from `storyFeedService` vs `storyDraftService` (TS2308) — `storyFeedService` now imports the type from `storyDraftService` instead of redeclaring it.

### Added
  - **Parel Stories — Prisma:** `Story`, `StoryReaction`, `StoryView`, `StoryChallenge`, `StoryChallengeEntry`, `StoryCollection`, `StoryCollectionItem`, `StoryTemplate`, `RatingRequest`, `RatingResult` in `packages/db/schema.prisma`; `User` relations for the same. Migration `packages/db/migrations/20260331130000_parel_stories/migration.sql`. Run `prisma migrate deploy` (or your usual migrate path) against Postgres before relying on these tables in production.
  - **@parel/core:** package export `"./cache"` for `storyRankingService` / `weeklyStoryService` imports.

### Fixed
  - **@parel/story:** TypeScript — `storyFeedService` return used undefined `feedItems` (now `storiesToReturn`); `storyRemixService` invalid `include`+`select` on `findUnique`; `getRemixChainDepth` inference vs `Story` type alias; `storyDraftService` publish return narrowed to draft types; `storyService` AURE context tolerates null `summaryText`; `weeklyStoryService` quest highlights use `userQuest` (existing `user_quests` table) instead of non-existent `questProgress`; `tsconfig` `moduleResolution: "bundler"` for `@parel/core/cache` subpath.

## [0.47.08] - 2026-03-09

### Added
  - **C14 — Tailwind Tokens Only:** Centralized semantic design tokens. New: `subtle` (theme-aware), `bg-bg-surface`, `shadow-panel`. Default `--color-*` vars in globals.css for SSR. Docs: `docs/tailwind-tokens.md`.
  - **C11 — DX Improvements (Import Lint):** ESLint `no-restricted-imports` forbids `@parel/*/src/**` and `@parel/*/dist/**`; consumers must use package public APIs. Override exempts `archive/**`. Docs: `docs/import-discipline.md` (when to use `@/` vs `@parel/*`, forbidden patterns, public-API rules).
  - **Content Pack Packaging (C10):** Pack format v1 with manifest.json + JSONL content files. Loader in `packages/db/content` (`loadPackManifest`, `loadQuestionsFromPack`, `loadPollsFromPack`, `resolvePackPath`, `loadContentPack`). Versioning: `schemaVersion` for format compatibility, `version` for content revision, stable `packKey`. Docs: `docs/content-packs.md`.

### Changed
  - **Changelog page + ChangelogSummary + ChangelogSkeleton:** Replaced hardcoded slate palette (`bg-[#0f172a]`, `bg-slate-800`, `border-slate-600`, `text-slate-100`) with tokens (`bg-bg-muted`, `bg-card`, `border-border`, `text-text`, `text-subtle`). Inputs/selects use `bg-card`, `placeholder:text-subtle`.
  - **Starter flow:** Questions moved from hardcoded array to `content-packs/starter/` (manifest.json + questions.jsonl). `ensureStarterFlow` loads via `loadQuestionsFromPack`.
  - **Alpha feedback poll:** Poll definitions moved to `content-packs/alpha-feedback-v01/` (manifest.json + polls.jsonl). `ensureAlphaFeedbackPoll` loads via `loadPollsFromPack`. Title from manifest.

## [0.47.05] - 2026-03-02

### Added
  - **Route-Level Code Split (#66):** Dynamic imports for heavy route panels. Admin dashboard and ops client load on demand (admin-only, ssr: false). Reports page charts (recharts) extracted to ReportsCharts and loaded dynamically with skeleton placeholder. Reduces initial bundle for non-admin users; recharts chunk loads only when visiting reports.

### Changed
  - **admin/page.tsx:** AdminDashboard now dynamic import with "Loading admin…" placeholder.
  - **admin/ops/page.tsx:** AdminOpsClient now dynamic import with "Loading ops…" placeholder.
  - **reports/page.tsx:** Recharts (BarChart, PieChart) moved to ReportsCharts.tsx; stats grid and table render first; charts load in separate chunk with skeleton.

## [0.47.04] - 2026-03-02

### Added
  - **Monorepo Prune (#73):** Archived unused packages to reduce workspace noise. `@parel/lore` and `@parel/narrative` moved to `archive/packages/` (no active imports). Added `docs/archive-map.md` documenting what was archived and why.

### Changed
  - **Workspace config:** Removed `archive/*` from `pnpm-workspace.yaml` so archive is excluded from active workspace. Removed lore and narrative from root `tsconfig.json` references. Added `archive` to `tsconfig.base.json` exclude.

## [0.47.03] - 2026-03-02

### Added
  - **One Logger (#68):** Canonical logger at `@parel/core/logger` with `debug`, `info`, `warn`, `error`, and optional `child(scope)`. Environment-aware (debug only in dev or when LOG_LEVEL allows). Sensitive data redaction in production. Package export `./logger` added to @parel/core.

### Changed
  - **Logger consolidation:** `apps/web/lib/logger.ts` now re-exports from `@parel/core/logger`. `packages/core/utils/debug.ts` delegates to canonical logger; keeps `perfStart`, `debugIf`, `testLog`, `logApi`, `logQuery` for backward compat. `instrumentation.ts` Redis status uses `logger.info` instead of `console.log`. ESLint `no-console: warn` already in place.

### Fixed
  - **Admin ops page:** Variable shadowing (`params` used for both route param and run.params). Renamed to `runParams`.

## [0.47.02] - 2026-03-02

### Added
  - **Path aliases + public API (#64, #65):** Standardized imports across the monorepo. Apps use `@/*` for app-level code; packages use public imports only (`@parel/core`, `@parel/db/client`, `@parel/db/leaf`, `@parel/ui`). Public entrypoints: `lib/hooks/index.ts` barrel for `useUserSummary`, `useFeatureGate`, `usePresencePing`. Package exports: `@parel/db` exposes `./client`, `./leaf`; no direct `src/` or `dist/` imports from outside.

### Changed
  - **Import cleanup:** Replaced `@parel/db/src/client` with `@parel/db/client` in apps/web (API routes, services, workers) and tests. Replaced deep relative and `@parel/ui/atoms` Icon imports with `@parel/ui`. Replaced direct hook imports (`@/lib/hooks/useUserSummary`, `useFeatureGate`) with `@/lib/hooks` barrel. Jest `moduleNameMapper` updated for `@parel/db/client`.

## [0.47.01] - 2026-03-09

### Added
  - **Config unification (#57):** Single entrypoint `@parel/core/config/unified` for all config. Extended unified config schema with `AppMetaConfig` (version, name, features, feedback, stripe, qgen, scheduler). `apps/web/lib/config.ts` now bridges from unified config—calls `ensureUnifiedConfigInitialized()` and re-exports from `getConfig('app').meta`. No module maintains its own config copy; env vars read only in ConfigManager.applyEnvironmentOverrides.
  - **ESLint setup:** Root `.eslintrc.json` with next/core-web-vitals, react-hooks rules (error/warn), @typescript-eslint/no-unused-vars, no-console. Root package.json: eslint + eslint-config-next devDeps. apps/web config already had hook rules; root config enables monorepo-wide lint baseline. Prevents runtime errors like "useEffect is not defined".
  - **useUserSummary hook:** Shared `lib/hooks/useUserSummary.ts` as canonical frontend source for gameplay stats (level, xp, progress, funds, diamonds, streakCount, questionsAnswered). Uses SWR + `/api/user/summary`; subscribes to `xp:update` for revalidation; no fake Lv1/0 XP before load.

### Changed
  - **Navbar, profile, and dashboard unified under useUserSummary:** All three surfaces now use `useUserSummary()` as the canonical source for level, xp, and progress. Profile StatsPanel migrated from `/api/progression/stats` (level/xp) to the hook; still fetches progression API for stats (str/int/cha/luck) and archetype only. Added `getXpProgressDetail(xp)` in lib/xp as single progress calculation shared by all consumers. No fake Lv1 or 0 XP before load.
  - **Navbar XpBar and main dashboard:** Both use `useUserSummary()` instead of duplicate fetches. XpBar shows loading skeleton until data loads; MainPage uses hook data for hero, XP card, Level progress card. Session kept for auth only; progression comes from DB-backed summary.

### Fixed
  - **useEffect is not defined (main page):** Main page used `useEffect` without importing it from React. Added `useEffect` to the React import.
  - **Changelog body text not rendering:** Parser required `line.startsWith("- ")` but changelog uses `  - ` (leading spaces). Switched to regex `^\s*-\s+(.*)$` to match bullets with optional leading whitespace. Page now renders section items; summary counts reflect parsed arrays.

### Changed
  - **Changelog page styling:** Dark background (min-h-screen bg-bg) and card colors (bg-card, border-border) aligned with other pages.
  - **Changelog page dark theme fix:** Explicit slate palette (bg-[#0f172a], bg-slate-800, border-slate-600, text-slate-100) so page stays dark regardless of app theme. Protection banner uses amber-950/30 for dark mode.

### Added
  - **Changelog page improvements:** Filtering (search, month, type), month grouping, summary sidebar. API extends entries with `month`, `year`, `counts`. Client-side filters: searchText, selectedMonth, selectedType. ChangelogSummary component shows totalVersions, totalAdded, totalFixed, totalChanged, last update. Layout: filters + content + sidebar; sidebar collapses under content on small screens.

### Fixed
  - **ensureUnifiedConfigInitialized is not a function:** Added typeof guard in providers.tsx to avoid runtime crash when export fails to resolve; logs warning instead. Added root predev script to build @parel/core before dev.
  - **packages/db TS6307:** tsconfig.json used explicit `include` list that omitted opsRun.ts and feedbackConstants.ts. Replaced with `["index.ts", "src/**/*.ts"]` so all src files are included. Excluded src/seed.ts (schema drift) to restore build; pnpm dev now passes.
  - **DEV crash: ensureUnifiedConfigInitialized is not a function:** Verified dist/config/unified.js exports ensureUnifiedConfigInitialized; source packages/core/config/unified.ts has named export. Fixed providers.tsx: (1) all imports first, no calls before imports; (2) import from @parel/core/config/unified; (3) sync init after imports + UnifiedConfigBoot (useEffect fallback); (4) temp console.log sanity check. Clear .next cache and rebuild core to resolve stale bundling.
  - **Sigil runtime crash:** `generateSigilHeatmap` in `@parel/core` could throw on invalid input. Root cause: invalid/missing `buckets` (non-array or length ≠ 56) or undefined `seed`. Added defensive guards: throw explicit error when `buckets` is not an array; normalize `buckets.length !== 56` to 56 with zeros; default `seed` to `"anonymous"` when null/undefined. Function always returns `{ svg: string }`. No browser APIs; safe for SSR.
  - **generateSigilHeatmap is not a function:** Barrel import from `@parel/core` failed at runtime. Added dedicated export path `@parel/core/sigils/heatmap`. Sigil.tsx now imports from that path. Unit test `sigilHeatmap.test.ts` asserts `typeof generateSigilHeatmap === 'function'` to prevent regression.
  - **Unified config not initialized:** `getUnifiedConfig()` threw on Achievements and other pages when `useRewardToast`/`getUiConfig` ran before init. Root cause: `initUnifiedConfig()` was never called. Added `ensureUnifiedConfigInitialized()` (idempotent) in `@parel/core/config`. Bootstrap: (1) `instrumentation.ts` (Node) calls it at server startup; (2) `app/providers.tsx` calls it at module load (SSR + client). Entrypoint: `Providers` wraps the app and loads before any route; instrumentation runs before first request. Unit test `unifiedConfig.test.ts` verifies init.
  - **ensureUnifiedConfigInitialized is not a function:** Barrel `@parel/core/config` did not export it at runtime. Added dedicated export path `@parel/core/config/unified`. providers.tsx and instrumentation now import from that path. Fixed import order: all imports first, then init call. Export map: `"./config/unified": { types, import, require, default }`.

## [0.46.20] - 2026-03-03

### Added
  - **DEV-ONLY Schema drift guard:** `packages/db/src/dev/schemaGuard.ts` – `validateSchema()` checks users.starterFlowCompletedAt, feedbackRewardClaimed, isBeta. Wired in `instrumentation.ts` (Node runtime, APP_ENV=dev only). On missing column: throws "SCHEMA DRIFT DETECTED: missing column users.X. Run pnpm prisma:migrate:deploy". On OK: "[SchemaGuard] Prisma schema validated (dev)".

### Fixed
  - **SchemaGuard:** Prisma.join() with string array produced invalid SQL for PostgreSQL IN clause. Switched to $queryRawUnsafe with constant IN list (safe: compile-time values only).
  - **DEV Prisma schema drift:** `users.starterFlowCompletedAt` column missing. Root cause: migration `20260302120000_starter_flow_alpha` existed in packages/db/migrations but had not been applied. Ran `pnpm prisma:migrate:deploy` (tsx db-migrate-deploy) to apply 5 pending migrations including starter_flow_alpha.
  - **Diagnostic script:** db-diagnose.ts (DATABASE_URL, migrate status).

### Migration status
  - Prisma uses packages/db/migrations (same dir as schema.prisma). Column confirmed in DB.

## [0.46.19] - 2026-03-02

### Added
  - **Alpha Contributor badge:** When user completes Alpha Feedback – v0.1 and reward is granted, also grants badge ALPHA_CONTRIBUTOR (UserBadge + badgeType for header).
  - **Badge mechanism (reused):** Badge table + UserBadge; User.badgeType for header; seedBadges.ts / ensureAlphaFeedbackPoll; UserBadge component (badgeConfig).
  - **Badge key granted:** ALPHA_CONTRIBUTOR (no existing CONTRIBUTOR; minimal metadata, no levels).
  - **Granting:** Single place in /api/polls/respond; idempotent (check hasBadge before create); no duplicate rows.
  - **Completion message:** "Thanks. Reward claimed and badge unlocked."
  - **Rewarded Feedback flow:** Alpha testers get XP + coins for completing the Alpha Feedback poll pack after Starter Flow.
  - **User fields:** `feedbackRewardClaimed` (Boolean, default false), `isBeta` (Boolean, default false). Migration `20260302210000_user_feedback_reward`.
  - **Config:** `FEEDBACK_REWARD_XP = 100`, `FEEDBACK_REWARD_COINS = 50`, `FEEDBACK_ENABLED` (env: FEEDBACK_ENABLED or NEXT_PUBLIC_FEEDBACK_ENABLED).
  - **Poll completion hook:** When user completes all 5 polls in alpha-feedback-v01 pack, grants XP + coins once, sets `feedbackRewardClaimed = true`. No per-poll XP for alpha pack.
  - **Feedback prompt modal:** After Starter Flow completion: "Help shape Parel" / "1-minute feedback. Earn 100 XP + 50 coins." [Give feedback] [Maybe later]. SessionStorage dismiss; shows again next login until completed.
  - **/feedback/alpha:** 5-question wizard for Alpha Feedback pack. Optional freetext questions allow skip.
  - **Admin Alpha Feedback:** `/admin/feedback` – rewards granted count, % completion (vs starter-completed), distribution per option, freetext responses.
  - **Alpha Tester Feedback Pack:** Internal poll pack for first testers. Poll model supports `packKey`; migration `20260302200000_public_poll_pack_key`.
  - **Alpha Feedback – v0.1:** Structured 5-question poll pack: (1) "Did you understand what to do?" (single choice), (2) "What was the best moment?" (single choice), (3) "Would you come back tomorrow?" (single choice), (4) "What confused you the most?" (free text, optional), (5) "Complete this sentence: Parel is..." (free text, optional).
  - **ensureAlphaFeedbackPoll:** Idempotent seed script in packages/db/scripts; packKey `alpha-feedback-v01`. Seeded via db:seed:world (runSeedWorld).
  - **GET /api/polls?packKey=:** Filter polls by pack key; returns polls ordered by createdAt asc for wizard flow.
  - **Sigil v0.1 (heatmap):** Mirrored 7×8 heatmap profile flag based on recent activity (answers per day, last 56 days). Real data from user_responses; deterministic placeholder from userId+createdAt when no activity.
  - **getUserActivityBuckets(userId):** Returns `{ buckets: number[], placeholder: boolean }`; intensity 0–4; GET /api/user/activity-buckets (auth required).
  - **generateSigilHeatmap({ buckets, seed }):** packages/core; 7 rows × 8 cols, horizontal mirror, 5-level palette, viewBox scaling.
  - **Sigil.tsx:** Props userId, size (sm|md|lg), onClick, expandOnClick; fetches activity, renders SVG; placeholder hover: "New profile, sigil will evolve with activity."; click opens Dialog (large view).
  - **Integration:** Small Sigil in profile header (lg, expandable) and ProfileMenu top bar (sm, expandOnClick=false).
  - **Profile Sigil (MVP):** Deterministic 5x5 SVG sigil from user stats via `generateSigil(userId, stats)` in @parel/core (mirrored grid, small fixed palette, primary/border color buckets).
  - **Profile UI:** `ProfileSigil` component and integration on `/profile` header (recomputed from `/api/user/summary`, no storage or DB change).
  - **Leaderboard:** Small sigil in `PhotoLeaderboard` rows derived from entry scores (no extra requests).
  - **API:** `/api/profile/[id]/sigil` returns SVG for a given user (stats derived from level/karma/questions/streak, cacheable).
  - **OpsRun schema:** entityType, entityId, entityLabel, params (Json), warnings (Json, cap 20), errorStack (String, cap 4000). Migration 20260302180000 in both migrations folders.
  - **Standardized counts:** finishOpsRun normalizes counts to scanned, created, updated, skipped, failed, warnings (default 0).
  - **Wiki enrich / QuestionGen:** Structured counts and params; entityType/entityId/entityLabel for QuestionGen; errorStack on failure.
  - **Admin Ops list:** Client-side filter by type and status; status badges (success/failed/running); entityLabel as secondary line.
  - **Admin Ops detail:** Params JSON (pretty); warnings list (first 20); errorStack in collapsible details block.

### Changed
  - createOpsRun accepts optional entityType, entityId, entityLabel, params.

## [0.46.13] - 2026-03-02

### Added
  - **OpsRun progress tracking:** OpsRun model for internal bots (Question generator, Wiki enrichment). Tracks type, status, duration, counts, message, reportPath.
  - **packages/db:** OpsRun schema + migration (20260302170000). `createOpsRun`, `finishOpsRun` service.
  - **Wiki enrich:** Creates OpsRun at start, finishes on success/fail with counts + reportPath.
  - **QuestionGen processor:** Creates OpsRun per job, finishes on success/fail with counts.
  - **Admin UI:** `/admin/ops` table of last 50 runs; `/admin/ops/[id]` detail. GET /api/admin/ops, GET /api/admin/ops/[id] (admin only).

### Changed
  - Admin dashboard: Ops Runs card linking to /admin/ops.
  - Sidebar nav: Ops Runs link for admins.

## [0.46.12] - 2026-03-02

### Added
  - **WikiBot (tortoise) enrichment:** scripts/wiki-enrich.ts maps FlowQuestions to Wiki Seeds. Batch mode (--limit=10). Produces docs/wiki-enrich-report.md.
  - **FlowQuestion wiki fields:** wikiFillCandidate, worldContextKey, worldContextRegionPolicy, worldContextLabel. Migration 20260302160000.
  - **pnpm wiki:enrich:** Runs enrichment (dev env). pnpm wiki:report: prints report path.
  - **Wiki Seeds keys:** sleep_hours_avg, screen_time_hours_avg added to getWorldContext (placeholder values).
  - **Report per-question world context:** When question.worldContextKey exists, renders "<label> (<year>): <value> <unit> (sourceName)". Uses region from policy (userRegion | fixed:CZ | global).
  - **Starter questions:** ensureStarterFlow sets wikiFillCandidate=true (new + existing).

### Changed
  - Report API: worldContextRows built from each question's worldContextKey; region resolved via worldContextRegionPolicy.

## [0.46.11] - 2026-03-02

### Added
  - **World Context (Wiki Seeds):** Static, versioned real-world reference data (e.g. CZ avg income). No DB, no runtime fetches.
  - **packages/core/src/world/wiki-seeds/cz.json:** Minimal schema + 1 placeholder entry (income_monthly_avg).
  - **getWorldContext(region, key):** Loader in packages/core; exported from @parel/core.
  - **Report World Context row:** Optional "CZ average (2024): 75,000 CZK" on Summary/Report when region=CZ and data exists. Behind ENABLE_WORLD_CONTEXT_ROW.

### Docs
  - docs/COMMANDS.full.md: Wiki Seeds note — update values when validated.

## [0.46.10] - 2026-03-02

### Added
  - **Single source of truth for Redis:** `packages/redis` env (REDIS_URL, REDIS_DISABLED, hasRedis) and `getRedisClient()`. In dev, REDIS_URL unset => Redis disabled by default.
  - **checkPresenceRateLimit:** Implemented in lib/security/rateLimit (5 req/20s per IP) for presence/ping.
  - **Startup Redis status:** Dev-only log "Redis: enabled" or "Redis: disabled (no REDIS_URL)" at server start.
  - **No-op connection proxy:** queue/connection returns no-op when Redis disabled; workers exit gracefully.

### Fixed
  - **Direct ioredis creation removed** from: realtime.ts, broker.ts, queue/connection.ts, queue.ts, jobs/index.ts, queue/questionGenQueue.ts, jobs/questionGen.queue.ts, culturalFilter.ts, ai/context.ts, performance/cache.ts, events/join/route.ts, queue-config.ts, scheduler.worker.ts, questionGen.worker.ts. All use `getRedisClient()` from @parel/redis.
  - **checkPresenceRateLimit missing:** presence/ping now uses proper rate limit (was broken import).
  - **Edge runtime:** env hasRedis computed locally to avoid pulling ioredis into Edge (health route).
  - **REDIS_URL default:** No fallback to localhost in dev; unset => disabled.

### Changed
  - events/today, presence: use getRedisClient/hasRedis from @parel/redis.
  - queue-config createQueue: returns null when Redis disabled; getAllQueueStats returns [].
  - instrumentation.ts: logs Redis status on Node.js server start.

## [0.46.09] - 2026-03-02

### Added
  - **Redis optional in dev:** Redis is no longer required for local development. Set `REDIS_DISABLED=true` to run without it. No unhandled error events or log spam when Redis is unavailable.
  - **Env gate:** `REDIS_DISABLED` (boolean) and `REDIS_URL` (string). If `REDIS_DISABLED=true` or `REDIS_URL` is missing/empty, app uses in-memory fallback instead of ioredis.
  - **In-memory fallback:** `packages/redis` exports `memoryAdapter` (get/set/del with TTL) for cache/locks when Redis is disabled. Rate limit / locks return permissive behavior in dev.
  - **logOnce utility:** Connection errors logged at most once per process start to reduce spam.

### Fixed
  - **ioredis unhandled error:** Client now has `client.on("error", ...)` so connection failures (e.g. ECONNREFUSED) do not crash the process.
  - **smoke:web without Redis:** Smoke script sets `REDIS_DISABLED=true` when `REDIS_URL` is not provided, so smoke passes without a local Redis.

### Changed
  - **Presence / events:** Use centralized `@parel/redis` client instead of creating own ioredis instances.
  - **prod validation:** `REDIS_URL` not required when `REDIS_DISABLED` is set.

### Docs
  - docs/COMMANDS.md: Note that local Redis is optional; `REDIS_DISABLED=true` to run without.

## [0.46.08] - 2026-03-02

### Fixed
  - **useFeatureGate crash:** Hook now never throws. Early return when status !== "authenticated" or !session?.user with { allowed: false, message: "Sign in required." }. Safe mapper `mapSessionUserToGateUser` with defaults (level:1, isBeta:false). Try-catch around canAccessFeature. Does NOT read isPremium from session.
  - **canAccessFeature null-safety:** Falsy user returns { allowed: false, message: "Sign in required.", reason: { custom: { message: "Sign in required." } } } instead of proceeding with rule logic.
  - **Prisma User.isPremium error:** Removed isPremium, premiumUntil from auth JWT select (User model has no such fields). Session/token still include isPremium: false for compatibility; premium gating is TODO.
  - **premiumCheck.ts:** Stub returns false (no Prisma select). lib/season/service.ts: premium track always returns "Premium subscription required" until schema adds entitlement.
  - **RegionSelector crash (main page):** Replaced RegionSelector (placeholder returning null) with FooterLocaleToggle. Region/Language selector source: `@/components/FooterLocaleToggle` (uses `@/lib/i18n/useLocale`).
  - **main page ReferenceErrors:** Added lucide-react imports for AlertCircle (Unable to Load Profile EmptyState) and Trophy (No Achievements Yet EmptyState).
  - **canAccessFeature import error:** Added dedicated export path `@parel/core/config/featureGates` in packages/core package.json. useFeatureGate, FeatureGate, and tests now import from that path instead of `@parel/core/config` barrel.
  - **DEEP_REPORT gate:** Now level-only (level 5). Premium gate deferred until User.isPremium exists in schema.

### Added
  - **Unified feature lock system:** Centralized gate mechanics for UI features. `packages/core/config/featureGates.ts`: FeatureKey union (FLOW_BROWSER, CATEGORIES, RPG, DEEP_REPORT, INVITE, MARKETPLACE), LockReason types (level, premium, admin, beta, custom), `canAccessFeature(user, featureKey)` with message and priority (admin > premium > beta > level > custom).
  - **useFeatureGate(featureKey) hook:** `apps/web/lib/hooks/useFeatureGate.ts` - reads session (level, role, isPremium); SSR-safe; returns { allowed, message, reason }.
  - **FeatureGate component:** `mode="hide"` renders nothing when locked; `mode="placeholder"` renders lock affordance with tooltip. Uses existing Tooltip + Lock icon.
  - **Session includes level:** JWT/session now carries `level` for client-side gate checks without extra fetches.

### Changed
  - **NavLinks:** Arena (RPG) and Invite Friends use FeatureGate. Arena: placeholder when level < 3. Invite: disabled dropdown item with lock + tooltip when level < 3.
  - **Auth:** JWT and session callbacks add `level` from DB.

### Feature gates (initial rules)
  | Feature     | Unlock rule                 |
  |------------|-----------------------------|
  | FLOW_BROWSER | Level 3                    |
  | CATEGORIES   | Level 3                    |
  | RPG          | Level 3                    |
  | DEEP_REPORT  | Level 5 or Premium         |
  | INVITE       | Level 3                    |
  | MARKETPLACE  | Level 5                    |

### Tests
  - Unit test `tests/featureGates.test.ts` for canAccessFeature priority and messages.

## [0.46.07] - 2026-03-02

### Added
  - **Alpha Starter Flow (single canonical):** `STARTER_FLOW_SLUG="starter"` constant. Seed (`db:seed:world`) ensures idempotent starter category with `isStarter`, `visibleInBrowse=false`, 5 curated questions. First: "Have you ever met a ghost?"; others: sleep, phone time, spending, fate. Category metadata: `isStarter=true`, length 5, `visibleInBrowse=false` until Level 3.
  - **Onboarding routing (Level 3 gate):** First Play/flow run forces STARTER flow (no selection UI). Flow selection (categories/browse) unlocked at level >= 3 or when starter completed. `DEV_UNLOCK_FLOWS=1` skips gate. `getAvailableCategories(userId)` applies gate.
  - **Report/Summary screen (Option A - You vs The World):** After finishing starter flow: headline ("You are more X than Y% of players"), subheader ("Based on N responses"), 3 comparison rows (You vs Global synthetic stats), identity hint ("You are trending toward: The Curious Realist"), unlock note. CTAs: Continue, Back to Home. No economy, inventory, RPG, or technical stats.
  - **Synthetic comparison stats:** `getSyntheticGlobalStats(questionId, type, userAnswer)` deterministic per day; non-round numbers; stable N. Service in `lib/services/syntheticStats.ts`. `formatHours()` for numeric display.
  - **Storage:** `users.starterFlowCompletedAt` (nullable) set when starter report shown. POST `/api/flow/starter-complete` records completion.
  - **APIs:** GET `/api/flow/report?categoryId=` returns Option A payload. GET `/api/flow/categories` respects Level 3 gate via session.

### Changed
  - **flow-demo:** Single starter category auto-starts (no selection UI); shows "Starting your flow..." during launch. Result step shows Option A report when starter flow completed; otherwise legacy "Flow Complete!" with answered/skipped/XP grid.
  - **Seed:** `ensureStarterFlow()` in ensureBaselineData; runSeedWorld invokes it. Idempotent upsert of starter questions.

### Models / Schema
  - User: `starterFlowCompletedAt` (DateTime?)
  - SssCategory: `slug`, `isStarter`, `visibleInBrowse`

## [0.46.06] - 2026-03-02

### Added
  - **Safe deploy command:** `pnpm deploy` runs validate, then git add/commit/push. Aborts if validate fails. Vercel builds from Git. scripts/deploy.ps1.
  - **Tiny human command surface:** validate = big hammer (PASS/FAIL summary, fail-fast). scripts/validate.ps1 runs check:dev-sanity, typecheck, test, smoke:web, smoke:flow; optional e2e:local if RUN_E2E=true. scripts/daily.ps1: optional kill, then dev. docs/COMMANDS.md explains each command and underlying scripts. Root scripts: kill, daily, validate now invoke PowerShell scripts.
  - **Human-owned command list:** docs/COMMANDS.md is now minimal (2 commands per topic): daily, kill, validate, smoke:web, db:reset:world, db:seed:world, build:web, start:web. Full reference moved to docs/COMMANDS.full.md. New scripts: `daily` (= dev), `kill` (= kill-port 3001), `validate` (check:dev-sanity + typecheck + test, skips missing), `start:web` (prod mode port 3011), `help` (prints docs path). kill:3001 kept as alias of kill.
  - **Documentation gate for commands:** If any package.json scripts change (root, apps/web, packages/db), docs/COMMANDS.md must be updated in the same commit. `scripts/check-command-docs.mjs` computes a sha256 hash of script names and compares it to `<!-- commands-hash: ... -->` in docs/COMMANDS.md. `scripts/update-command-docs-hash.mjs` updates the marker. Root scripts: `pnpm check:command-docs` (gate), `pnpm docs:commands:update` (refresh). Wired into `check:dev-sanity`.
  - **scripts/kill-port.ps1:** Kill process(es) owning a TCP port. Usage: `.\scripts\kill-port.ps1 -Port 3001`.
  - **pnpm kill:3001:** Root script to free port 3001.
  - **docs/COMMANDS.md:** Canonical command reference with Daily / Recovery / DB / Release / Utilities grouping.

### Changed
  - **Script normalization:** Normalized root package.json scripts; no hardcoded Prisma --schema; scoped builds via `pnpm --filter`.
  - **build:web:** Now `pnpm --filter @parel/web... run build` (was `cd apps/web && pnpm run build:web`).
  - **typecheck:** Now `pnpm --filter @parel/web run typecheck` (was `cd apps/web && pnpm run typecheck`).
  - **prisma:generate:** Now `pnpm --filter @parel/db run prisma:generate` (uses package config).
  - **prisma:db:pull:** Now `pnpm --filter @parel/db exec prisma db pull` (uses package config).
  - **test:smoke:** Now alias of `pnpm smoke:flow`; deprecated in favor of `smoke:flow` or `smoke:web` per use case.

## [0.46.01] - 2026-03-01

### Added
  - **Alpha baseline seed contract:** docs/seed-baseline.md defines minimal invariants. ensureBaselineData(prisma) enforces: (1) admin user, (2) 4 RPG enemies, (3) 3 items, (4) flow category hierarchy, (5) 1 flow question. Idempotent; invoked early by runSeedWorld. Stops seed whack-a-mole on empty DB.
  - **RPG DLC gating + multi-character + Play enablement:** RPG is DLC-like enhancement on core Questions/Comparison app. Schema: User fields `rpgEnabled`, `rpgCreatedAt`, `rpgPromptSeenAt`, `rpgDismissedAt`, `activeCharacterId`; new `Character` model (userId, type, name); `CharacterEquipment` (characterId, slot, inventoryItemId). Eligibility: level >= 3 && answeredToday >= 5; users can create character anytime. API: GET `/api/rpg/status` (eligible, rpgEnabled, hasCharacter, activeCharacterId, shouldPromptCreate), POST `/api/rpg/dismiss`, `/api/rpg/enable`, `/api/rpg/disable`, POST `/api/rpg/character/create` (type, name?), POST `/api/rpg/character/set-active` (characterId). Play page: CreateCharacterGate when no character (inline class selector: mage, paladin, warrior, rogue, cleric); Enable RPG CTA when disabled. Arena link moved from admin extras to main nav for all logged-in users.
  - **Inventory unification (alpha canonical stash = UserItem):** CharacterEquipment now supports `userItemId` (canonical) and `inventoryItemId` (legacy fallback). Migration `20260301130000_character_equipment_user_item` adds userItemId FK to UserItem, makes inventoryItemId nullable. New service `equipCharacterItem(userId, characterId, slot, userItemId)` and `unequipCharacterSlot(userId, characterId, slot)`. New API: GET `/api/rpg/equipment?characterId=`, POST `/api/rpg/equipment/equip` (characterId, slot, userItemId), POST `/api/rpg/equipment/unequip` (characterId, slot). Read path: resolve userItemId first, inventoryItemId fallback. RPG loot: combatService and rewardsEngine now use `addItemToInventory` (UserItem) instead of `createInventoryItem` (InventoryItem). No new inventory tables added.

### Changed
  - **Seed:** ensureBaselineData runs first; seed-world adds fuller content. Alpha baseline only—use feature bootstrap for deeper data.
  - **Migration sync (prisma vs packages/db):** Added migrations to packages/db/migrations/ for schema already in packages/db/prisma/migrations/ so deploy applies correctly: users.birthYear (20260301140000), users.lastNewsSeenAt (20260301150000), flow_questions.challengeEnabled (20260301160000), daily_charms + user_daily_charms (20260301170000), roadmap_items + roadmap_votes (20260301180000), milestone_rules + milestone_deliveries (20260301190000). All seed scripts now set birthYear: 1990 on users. OAuth and test-login user creation also set birthYear.
  - **Play (Arena) admin gate removed:** `/play` no longer requires admin. NavLinks shows "Arena" in main nav for all authenticated users. Play page gates: no character → Create character flow; rpgEnabled false → Enable RPG button. Core flow unaffected when RPG APIs fail.
  - **Canonical stash = UserItem:** `/api/inventory` and user-facing inventory use UserItem. RPG equipment uses UserItem via CharacterEquipment.userItemId. InventoryItem is legacy; read fallback only. TODO: remove InventoryItem after Alpha.
  - **RPG inventory stabilization (InventoryItem read-only for RPG):** POST `/api/rpg/equip` now accepts `{ characterId, slot, userItemId }`; back-compat: `inventoryItemId` maps to UserItem via (userId, itemId) or returns "Legacy item cannot be mapped; re-add item to stash". POST `/api/rpg/unequip` accepts `{ characterId, slot }`; back-compat: `inventoryItemId` finds CharacterEquipment and clears. equipItem/unequipItem deprecated (throw); no InventoryItem writes from RPG. getTotalItemPower/applyItemEffects: dual-read—CharacterEquipment.userItemId (active character) first, InventoryItem fallback. createInventoryItem: dev-only warn when called. Verified: no RPG endpoint creates/updates InventoryItem.

### Models reused
  - User (added RPG fields), UserItem (canonical stash), Item. CharacterEquipment extended with userItemId. InventoryItem legacy; CharacterEquipment.inventoryItemId kept for backwards compat.

### TODOs
  - Remove InventoryItem after Alpha. Inventory UI (equipment loadout), prompt modal for shouldPromptCreate, profile settings toggle for rpgEnabled, character switcher when >1 characters.

## [0.45.26] - 2026-02-27

### Fixed
  - **Prisma generate zod warning:** zod-prisma-types could not determine zod version when running from monorepo root — "Falling back to default 4.0.0" warning. Added `zod` as root dependency so the generator can resolve it; warning should be eliminated or reduced.
  - **Prisma migrate deploy DATABASE_URL error:** `prisma:migrate:deploy` failed with "Environment variable not found: DATABASE_URL" because it ran Prisma directly without env loading. Project uses `DATABASE_URL_DEV` / `DATABASE_URL_PROD` via APP_ENV, not DATABASE_URL directly. Created `packages/db/scripts/db-migrate-deploy.ts` — loads .env via `_loadEnv`, sets `DATABASE_URL` from `resolveDatabaseUrl` (DATABASE_URL_DEV when APP_ENV=dev, DATABASE_URL_PROD when prod), then runs `prisma migrate deploy`. Root script `prisma:migrate:deploy` now invokes this tsx script instead of calling Prisma directly. Migrate deploy works in both dev and prod (set APP_ENV=prod and DATABASE_URL_PROD for production).

### Added
  - **db-migrate-deploy.ts:** Wrapper script for `prisma migrate deploy` that loads env files (root .env, .env.local, apps/web/.env, apps/web/.env.local) and resolves DATABASE_URL from DATABASE_URL_DEV or DATABASE_URL_PROD before invoking Prisma. Ensures migrations run correctly regardless of which env vars are defined.


## [0.49.05] - 2026-03-31

### Changed (deploy config alignment)
  - **Vercel Root Directory = `apps/web`:** Removed **repo-root** `vercel.json` (it pinned `buildCommand` / `installCommand` to `build:light` / `install:light`, `outputDirectory: apps/web/.next`, and `rewrites` to `/apps/web/$1`, which conflict with dashboard defaults when the project root is `apps/web`). Added **`apps/web/vercel.json`** with **`framework`**, **`regions`**, **`env` / `build.env`**, **`headers`**, **`redirects`** only—no `buildCommand`, `installCommand`, `outputDirectory`, `devCommand`, or path rewrites so **Build = `pnpm run build`**, **Install = `pnpm install --frozen-lockfile`**, and **output `.next`** stay dashboard-controlled.
  - **`apps/web/package.json`:** Set **`packageManager`** to **`pnpm@10.0.0`** (matches workspace root) so installs from the app directory use the intended pnpm version.

### Notes
  - **Redirect `/docs` → `/BETA_LAUNCH_v0.13.2k.md`:** The markdown file currently lives at the **monorepo root**, not under `apps/web/public`. If the redirect should serve that doc in production, add a copy (or symlink) under **`public/`** or change the destination.

## [0.49.04] - 2026-03-31

### Notes (deploy / build scope)
  - **Vercel light-build closure:** `packages/rating` and `packages/notifications` are **not** imported by `apps/web`; they appear because `apps/web` depends on `@parel/story`, and `packages/story/package.json` lists them even though current `story` **package exports** send most story APIs to **stubs** (real `src` that imports rating/notifications is not what Next resolves for those entry points). **`@parel/api`** is a direct `apps/web` dependency and is used across many API routes; it stays in the closure.

## [0.49.03] - 2026-03-31

### Fixed
  - **Build without `DATABASE_URL`:** `lib/env.ts` no longer calls `process.exit(1)` during `next build` when `NODE_ENV=production` and `DATABASE_URL` is unset (e.g. local/CI). Production guard now skips while Next sets **`NEXT_PHASE=phase-production-build`** (page-data workers) or **`npm_lifecycle_event=build`** (root script). Non-Vercel **`next start`** still requires real `process.env` values for `DATABASE_URL`, `STRIPE_SECRET_KEY`, and `REDIS_URL` (unless Redis disabled).

## [0.49.02] - 2026-04-02

### Added
  - **OpsRun debug (MVP):** `@parel/db` `OpsRun` helpers accept types **`SEED`** and **`API_ERROR`**; `createOpsRun` optional **`message`** on create. **`POST /api/admin/seed-db`** opens an OpsRun before `runSeedWorld`, **`finishOpsRun`** on success (`Seeder completed`) or failure (message + `errorStack`). **`GET /api/progression/stats`** and **`GET /api/admin/visits`** catch paths record **`API_ERROR`** via `createOpsRun` + **`finishOpsRun`** with `params.route`. **`/admin/ops`** client polls every **8s** (`quiet` refresh to avoid loading flicker); blurb updated. Detail page unchanged (message, collapsible stack, params JSON already present).
  - **User session trace (lightweight):** `apps/web/lib/logEvent.ts` — fire-and-forget `createOpsRun` + `finishOpsRun` (`success`). **Demo pipeline** (`flow_demo`): **`POST /api/flow/start`** → `flow_start`; **`GET /api/flow/question`** (no next) → `flow_complete`; **`POST /api/flow/answer`** → `question_answer` / `question_skip`; each includes **`params.channel`** = `flow_demo`. **Category route** (`/flow/[categoryId]`, `flow_category`): **`GET /api/flow/[categoryId]/next`** → `flow_start` when the user has no prior responses in that category, **`flow_complete` when there is no next question; **`POST .../answer`** and **`POST .../skip`** → `question_answer` / `question_skip`. **Legacy `FlowRunner`:** **`POST /api/flow-answers`** logs `question_answer` / `question_skip` with **`channel: legacy_flow_answers`** (including mock-question path). **Admin:** **`GET /api/admin/ops?userId=`** filters with Prisma JSON **`params.userId`** (latest 50 matches); ops UI debounces the User ID field. Trace rows also set **`params.userId`** for filtering.

### Fixed
  - **Flow category HTTP API:** `GET /api/flow/[categoryId]/next` called `getNextQuestionForUser` with **arguments reversed** (category id was passed as user id). **`POST /api/flow/[id]/answer`** invoked `answerQuestion` from `flowService` with **two string arguments** while that function expects a **`FlowAnswer`** object, so answers were not persisted correctly; the handler now uses **`recordFlowAnswer`** plus **`addXP`**, **`updateHeroStats`**, and **`publishEvent`** (aligned with **`POST /api/flow/answer`**) and returns basic stats in the JSON body.
  - **`/flow/[categoryId]` UI:** Uses shared **`QuestionInput`** (same behaviors as **`FlowRunner`**): **RANGE** is a **Radix `Slider`** (1–10, default 5); **NUMBER** / **`NUMERIC`** use a number field; **`MULTIPLE_CHOICE`** is normalized to **`MULTI_CHOICE`**. **Submit** sends JSON (`optionIds`, `textValue`, or `numericValue`). **`POST /api/flow/[id]/answer`** validates **RANGE** as an integer **1–10** and persists a clamped value.
  - **`/flow-demo`:** Question step refactored to the same **`QuestionInput`** + **`getInitialValue`** / **`isValidAnswer`** / **`toApiPayload`** helpers as category flow; inline radios/checkboxes/inputs removed. **RANGE** and **`NUMERIC`→NUMBER** behavior matches **`/flow/[categoryId]`**; failed submit surfaces API/toast error body when available.
  - **Notifications:** `NotificationBell` called `res.json()` on `apiFetch` (`safeApiFetch`), which returns `{ ok, data }` — not a `Response`. Load/open handlers now read the JSON body from `res.data`.
  - **`GET /api/events/today`:** Wrapped cache + Prisma path in `try/catch`; on any failure returns **200** with `{ success: true, event: null, region, timestamp }` so clients never depend on a failing DB/Redis for a valid empty payload.
  - **`GET /api/progression/stats`:** Wrapped handler in `try/catch`; on throw returns **200** with JSON matching the usual `successResponse` shape (`success`, `data` with null stats / safe defaults, `error: 'fallback'`, `timestamp`) so the client never receives non-JSON or hard failures that break `res.json()`.
  - **`GET /api/admin/visits`:** `try/catch` around stats queries with `NextResponse.json(visitsEmptyPayload)` on failure (all counters **0**, `ok: true`). Corrected 7d `Promise.all` destructuring (anonymous vs logged `groupBy`) and typo `loggedUsers7dGrouped` → `loggedUsersGrouped7d`, which could cause runtime failure before the catch.
  - **`POST /api/admin/seed-db`:** Single outer `try/catch` around session, admin check, env gate, and `runSeedWorld()`. On throw: **200** JSON `{ success: false, ok: false, error }` plus structured server log. Success payload includes `success: true` alongside existing `ok` / `message` / `stats`. Auth and production guard still return **401** / **403** with JSON.
  - **Admin logging / action log:** `POST` admin `trigger()` in `AdminDashboard` reads `apiFetch` failures and JSON `data.success === false` / `data.error` (and truncates long messages ~280 chars). Lines show `Fail — {error}` instead of a bare Fail. **`GET /api/admin/visits`** and **`GET /api/progression/stats`** catch blocks log `console.error('[API ERROR]', { route, error })` and return **200** JSON with `success: false` and truncated `error` where applicable; visits empty payload adds `success: false` + `ok: false` on error. **Seed-db** catch aligned to same `[API ERROR]` log pattern + truncated `error` in body.

## [0.49.01] - 2026-03-31

### Fixed
  - **@parel/story:** Duplicate `StoryVisibility` re-export from `storyFeedService` vs `storyDraftService` (TS2308) — `storyFeedService` now imports the type from `storyDraftService` instead of redeclaring it.

### Added
  - **Parel Stories — Prisma:** `Story`, `StoryReaction`, `StoryView`, `StoryChallenge`, `StoryChallengeEntry`, `StoryCollection`, `StoryCollectionItem`, `StoryTemplate`, `RatingRequest`, `RatingResult` in `packages/db/schema.prisma`; `User` relations for the same. Migration `packages/db/migrations/20260331130000_parel_stories/migration.sql`. Run `prisma migrate deploy` (or your usual migrate path) against Postgres before relying on these tables in production.
  - **@parel/core:** package export `"./cache"` for `storyRankingService` / `weeklyStoryService` imports.

### Fixed
  - **@parel/story:** TypeScript — `storyFeedService` return used undefined `feedItems` (now `storiesToReturn`); `storyRemixService` invalid `include`+`select` on `findUnique`; `getRemixChainDepth` inference vs `Story` type alias; `storyDraftService` publish return narrowed to draft types; `storyService` AURE context tolerates null `summaryText`; `weeklyStoryService` quest highlights use `userQuest` (existing `user_quests` table) instead of non-existent `questProgress`; `tsconfig` `moduleResolution: "bundler"` for `@parel/core/cache` subpath.
>>>>>>> ec7f2b9 (vercel build fix 4.6.2026)



## [0.48.07] - 2026-03-24

### Added
  - **C14 — Tailwind Tokens Only:** Centralized semantic design tokens. New: `subtle` (theme-aware), `bg-bg-surface`, `shadow-panel`. Default `--color-*` vars in globals.css for SSR. Docs: `docs/tailwind-tokens.md`.
  - **C11 — DX Improvements (Import Lint):** ESLint `no-restricted-imports` forbids `@parel/*/src/**` and `@parel/*/dist/**`; consumers must use package public APIs. Override exempts `archive/**`. Docs: `docs/import-discipline.md` (when to use `@/` vs `@parel/*`, forbidden patterns, public-API rules).
  - **Content Pack Packaging (C10):** Pack format v1 with manifest.json + JSONL content files. Loader in `packages/db/content` (`loadPackManifest`, `loadQuestionsFromPack`, `loadPollsFromPack`, `resolvePackPath`, `loadContentPack`). Versioning: `schemaVersion` for format compatibility, `version` for content revision, stable `packKey`. Docs: `docs/content-packs.md`.

### Changed
  - **Changelog page + ChangelogSummary + ChangelogSkeleton:** Replaced hardcoded slate palette (`bg-[#0f172a]`, `bg-slate-800`, `border-slate-600`, `text-slate-100`) with tokens (`bg-bg-muted`, `bg-card`, `border-border`, `text-text`, `text-subtle`). Inputs/selects use `bg-card`, `placeholder:text-subtle`.
  - **Starter flow:** Questions moved from hardcoded array to `content-packs/starter/` (manifest.json + questions.jsonl). `ensureStarterFlow` loads via `loadQuestionsFromPack`.
  - **Alpha feedback poll:** Poll definitions moved to `content-packs/alpha-feedback-v01/` (manifest.json + polls.jsonl). `ensureAlphaFeedbackPoll` loads via `loadPollsFromPack`. Title from manifest.


## [0.48.06] - 2026-03-22

### Added
  - **Community translation MVP (submission + admin review):** Prisma `TranslationSuggestion` (`translation_suggestions`): `entityType` (question \| poll), `entityId`, `language`, `original`, `suggestion`, `status` (pending \| approved \| rejected). `POST /api/translation/suggest` (optional auth). `GET /api/admin/translation-suggestions`, `PATCH /api/admin/translation-suggestions/[id]` (approve/reject only — no auto-apply). Admin page `/admin/translation` (table + actions); dashboard link under Questions. UI: `SuggestTranslationButton` on question detail `/q/[id]`. Migration `20260323120000_translation_suggestions`. Does not replace i18n or English UI.
  - **Returning users % (7d):** Derived from `AppVisit` only — `returningUsers7d` = logged-in users with more than one visit in the rolling 7d window; `returningUsersPct7d` = percent of `activeLoggedUsers7d` (0 if denominator 0), one decimal. Single `groupBy` with `_count._all`. Admin card: Returning users (7d), Returning % (7d).
  - **App visits — active 7d:** `GET /api/admin/visits` returns `activeUsers7d` (visit rows in last 7 days), `activeLoggedUsers7d` (distinct logged-in users in 7d), `anonymousUsers7d` (anonymous visit rows in 7d). Admin **App Visits** card shows Active users (7d), Logged users (7d), Anonymous (7d). Also fixed visit stats client state to map all API fields (24h + 7d).
  - **App visits — active 24h:** `GET /api/admin/visits` now returns `activeUsers24h` (count of `AppVisit` rows in last 24h, includes anonymous), `activeLoggedUsers24h` (distinct non-null `userId` in last 24h), `anonymousVisits24h` (rows with `userId` null in last 24h). Admin **App Visits** card shows Active visits (24h), Logged users (24h), Anonymous visits (24h).
  - **App visitor counter (admin):** Prisma `AppVisit` (`app_visits`), optional `userId`. `POST /api/visit` records a visit; client `VisitLogger` in `providers` logs once per session via `sessionStorage` flag `visit_logged` + fetch. `GET /api/admin/visits` (admin): `totalVisits`, `visitsToday` (UTC day start), `uniqueUsersToday` (distinct logged-in users). Admin dashboard card **App Visits** with the three numbers. Migration `20260322130000_app_visits`.
  - **Flow Reward MVP (post-flow reveal):** `generateFlowReward()` in `@parel/core` (`packages/core/src/rewards/flowReward.ts`) — rarity mix common 70% / uncommon 25% / rare 5%; rewards coins/XP/diamonds per spec. `POST /api/flow/reward` (session required): rolls reward, writes `FlowRewardLog`, applies coins/XP/diamonds to user. Prisma model `FlowRewardLog` + migration `20260322120000_flow_reward_log`. Flow-demo: on flow completion fetches reward and shows `FlowRewardCard` (fade/scale animation, optional “more active than X%” line). CSS `animate-flow-reward-pop` in `globals.css`.

## [0.47.17] - 2026-03-10

### Added
  - **Arc System implementation (C21):** Insight checkpoints every 8 questions: after answering, shows checkpoint card with progress, XP, insight text. Options: Continue flow, Choose another topic. GET /api/flow/checkpoint returns topicName, answeredCount, progressPct, insightText. FlowQuestion.arcStep (entry|context|reflection|comparison|wildcard) for 4-step narrative ordering; getNextQuestion prefers arc step order when present. Flow progress display: "Answered: X of ~Y" when totalQuestions available from start. FlowQuestionRecord.arcStep in content packs for seeding. Doc: docs/architecture/C21-arc-system.md.
  - **Prediction Battles (C20):** Forecast future outcomes, resolve later, accuracy + streaks. Schema: PredictionQuestion (title, description, categoryId, options, correctOptionIdx, resolutionDate, status), PredictionAnswer (userId, predictionId, selectedOptionIdx). User: predictionCorrectCount, predictionResolvedCount. UserStreak: predictionCorrectStreak, predictionLongestStreak. Service: submitPredictionAnswer, resolvePrediction, getPredictionQuestions, getUserPredictionStats, getPredictionLeaderboard. APIs: GET /api/predictions, POST /api/predictions/[id]/answer, GET /api/predictions/stats, GET /api/predictions/leaderboard, POST /api/admin/predictions, POST /api/admin/predictions/[id]/resolve. Resolution updates all answerers’ accuracy and streaks. Docs: docs/architecture/C20-prediction-battles.md.
  - **Skip Topic Suggestion (Flow):** When user skips 2+ questions in a flow, show gentle suggestion: "Not your mood? Try a different flow." Modal options: "Continue this topic" or "Choose another topic". Suggestion appears once per flow, dismissible (X = continue). Choosing another topic ends flow and returns to Flow Choice screen. Metrics: POST /api/flow/skip-suggestion records `flow_skip_suggestion_triggered` and `flow_skip_suggestion_accepted` in audit log.
  - **Tag System v1:** Semantic labels for FlowQuestions. Option A: `FlowQuestion.tags` (string[]). Tag rules: lowercase, short, single concept, no spaces (hyphen ok). `lib/tags.ts`: `normalizeTag`, `normalizeTags` for validation. Content pack: `FlowQuestionRecord.tags`, starter ghost question example. Admin: `GET /api/admin/flow-questions`, `PATCH /api/admin/flow-questions/[id]` (tags). Admin page `/admin/questions`: view, edit, add, remove tags. "Manage Tags" link on Admin Dashboard. Supports distance rules, flow generation, wildcards.
  - **Distance Rule System v1 (C19):** Filter layer for question selection to avoid similar questions appearing too close together. Distance = number of questions shown (not time). `getRecentQuestionHistory(userId, limit)` abstraction (UserResponse source). Central config: `distanceRules` (question: 500, subcategory: 100, category: 200, tag: 120). Filter pipeline: exact → subcategory → category → tag. Flow exception: relax category/subcategory for current flow topic; exact question repeat always blocked. Fallback: relax category when too few candidates remain. `FlowQuestion.tags` (string[]) for tag distance / future semantic clustering. Performance: load history once, pre-index, filter in memory.
  - **Flow Choice System (C18):** API `GET /api/flow/choices?exclude=id1,id2` returns 5 flow candidates. `getFlowChoices(userId, excludeIds)` in flow-skeleton: shuffle for diversity, excludeIds for refresh. Flow-demo: uses choices API; "Show new topics" button (refresh with exclude); Back to Home; optional tag per card (fun, deep, personal, quick). Max 5 cards, no scroll. Single starter still auto-starts.
  - **Flow System (C17):** Flow Topic selection (mood layer). Topic cards with title, subtitle, mood color from `lib/flowTopics.ts`. Categories API now returns `slug` for topic mapping. Display up to 4 topics; subtitles for Work, Family, Lifestyle, Fun, etc. User control: "Change topic" and "End flow" buttons during question step—both return to topic selection without penalty.
  - **Similarity Engine / Parallels (C16):** Implemented Parallels system. Service `lib/services/parallelsService.ts`: computes user similarity from UserResponse answer overlap (weighted overlap, min 3 shared questions). API `GET /api/parallels`: returns top 5 parallels for current user. Components: `ParallelCard` (similarity %, shared count, biggest disagreement, Compare CTA), `ParallelsSection` (fetches and displays parallels). Integrated into flow-demo result step (starter and generic Flow Complete). Compare links to `/compare/[userId]` for profile comparison.
  - **Flow Choice System spec (C18):** Doc `docs/architecture/C18-flow-choice-system.md`. Before new flow: 5 themed flow choices from category hierarchy. UX: no scroll, fast choice, "Refresh choices" action. Mobile-first: title, subtitle, 5 cards, 1 refresh; per card: title, subtitle, mood, optional tag (fun/deep/popular/quick). Generation v1: candidates from category branches, heuristic diversity (mix tones: serious/personal/neutral/fun/reflective), simple history filtering. Performance: render fast, no AI, no heavy DB at choice time. Actions: choose, refresh, back. Out of scope v1: AI, personalization, complex animations.
  - **Flow System spec (C17):** Doc `docs/architecture/C17-flow-system.md`. Evolves Arc into Flow: short themed question sequences (3–8 questions). Flow Topics (mood layer) with 3–4 choices (Work, Family, Fun & Weird, Lifestyle). Structure: light entry → context → reflection → comparison → wildcard. User control: skip, change topic, end early. Mobile-first, minimal UI. Post-flow insight (Parallels, stats, disagreement). Entry triggers: previous flow done, "Answer Questions" opened, daily action. Future: seasonal/regional/AI-curated flows.
  - **Analytics prerequisites (Clarity + GA4):** Doc `docs/analytics-prerequisites.md`. Prerequisites for Microsoft Clarity and Google Analytics 4 before first real testers. Scope: Clarity (replay, heatmaps), GA4 (traffic, events). Account/setup prereqs; app prereqs (layout placement, env vars: CLARITY_PROJECT_ID, NEXT_PUBLIC_GA_MEASUREMENT_ID); event planning starter list (first_question_answered, first_flow_completed, report_shown, parallel_opened, compare_clicked, feedback_submitted); privacy/ops checklist. No implementation yet.
  - **Feedback Capture system (Alpha):** Lightweight bug/issue reporting for alpha testers. Floating "Report issue" button opens modal with: issue type (bug, UX issue, confusing result, suggestion), short description, optional screenshot (file upload/drag-drop—no in-app capture in Alpha). Auto-captured context: route, user ID, timestamp, device, browser/OS, app version, feature flags. Backend: feedback API, DB storage, metadata + attachments. Admin page: filter by type, sort by date, user link, screenshot preview. Hint: "Use Snipping Tool (PC) or screenshot on mobile." Alpha goal: submit in under 10s with enough context to reproduce.
  - **Similarity Engine / Parallels spec (C16):** Architecture doc `docs/architecture/C16-similarity-engine-parallels.md`. Profile vectors from poll/question answers, predictions; weighted overlap scoring; Parallels list surfaced after Arc/Flow. Loop: Answer → Compare → Discover Parallel → Compare Again → New Question. UI: parallel card (similarity %, shared answers, disagreement, "Compare now"). Update triggers: new poll/question/prediction. Success metric: ≥3 extra questions per session after discovering a parallel.

## [0.47.08] - 2026-03-09

### Added
  - **C14 — Tailwind Tokens Only:** Centralized semantic design tokens. New: `subtle` (theme-aware), `bg-bg-surface`, `shadow-panel`. Default `--color-*` vars in globals.css for SSR. Docs: `docs/tailwind-tokens.md`.
  - **C11 — DX Improvements (Import Lint):** ESLint `no-restricted-imports` forbids `@parel/*/src/**` and `@parel/*/dist/**`; consumers must use package public APIs. Override exempts `archive/**`. Docs: `docs/import-discipline.md` (when to use `@/` vs `@parel/*`, forbidden patterns, public-API rules).
  - **Content Pack Packaging (C10):** Pack format v1 with manifest.json + JSONL content files. Loader in `packages/db/content` (`loadPackManifest`, `loadQuestionsFromPack`, `loadPollsFromPack`, `resolvePackPath`, `loadContentPack`). Versioning: `schemaVersion` for format compatibility, `version` for content revision, stable `packKey`. Docs: `docs/content-packs.md`.

### Changed
  - **Changelog page + ChangelogSummary + ChangelogSkeleton:** Replaced hardcoded slate palette (`bg-[#0f172a]`, `bg-slate-800`, `border-slate-600`, `text-slate-100`) with tokens (`bg-bg-muted`, `bg-card`, `border-border`, `text-text`, `text-subtle`). Inputs/selects use `bg-card`, `placeholder:text-subtle`.
  - **Starter flow:** Questions moved from hardcoded array to `content-packs/starter/` (manifest.json + questions.jsonl). `ensureStarterFlow` loads via `loadQuestionsFromPack`.
  - **Alpha feedback poll:** Poll definitions moved to `content-packs/alpha-feedback-v01/` (manifest.json + polls.jsonl). `ensureAlphaFeedbackPoll` loads via `loadPollsFromPack`. Title from manifest.

## [0.47.05] - 2026-03-02

### Added
  - **Route-Level Code Split (#66):** Dynamic imports for heavy route panels. Admin dashboard and ops client load on demand (admin-only, ssr: false). Reports page charts (recharts) extracted to ReportsCharts and loaded dynamically with skeleton placeholder. Reduces initial bundle for non-admin users; recharts chunk loads only when visiting reports.
  - **Monorepo Prune (#73):** Archived unused packages to reduce workspace noise. `@parel/lore` and `@parel/narrative` moved to `archive/packages/` (no active imports). Added `docs/archive-map.md` documenting what was archived and why.

### Changed
  - **admin/page.tsx:** AdminDashboard now dynamic import with "Loading admin…" placeholder.
  - **admin/ops/page.tsx:** AdminOpsClient now dynamic import with "Loading ops…" placeholder.
  - **reports/page.tsx:** Recharts (BarChart, PieChart) moved to ReportsCharts.tsx; stats grid and table render first; charts load in separate chunk with skeleton.

## [0.47.04] - 2026-03-02

### Changed
  - **Workspace config:** Removed `archive/*` from `pnpm-workspace.yaml` so archive is excluded from active workspace. Removed lore and narrative from root `tsconfig.json` references. Added `archive` to `tsconfig.base.json` exclude.

## [0.47.03] - 2026-03-02

### Fixed
  - **Admin ops page:** Variable shadowing (`params` used for both route param and run.params). Renamed to `runParams`.

## [0.47.02] - 2026-03-02

### Added
  - **One Logger (#68):** Canonical logger at `@parel/core/logger` with `debug`, `info`, `warn`, `error`, and optional `child(scope)`. Environment-aware (debug only in dev or when LOG_LEVEL allows). Sensitive data redaction in production. Package export `./logger` added to @parel/core.
  - **Path aliases + public API (#64, #65):** Standardized imports across the monorepo. Apps use `@/*` for app-level code; packages use public imports only (`@parel/core`, `@parel/db/client`, `@parel/db/leaf`, `@parel/ui`). Public entrypoints: `lib/hooks/index.ts` barrel for `useUserSummary`, `useFeatureGate`, `usePresencePing`. Package exports: `@parel/db` exposes `./client`, `./leaf`; no direct `src/` or `dist/` imports from outside.

### Changed
  - **Import cleanup:** Replaced `@parel/db/src/client` with `@parel/db/client` in apps/web (API routes, services, workers) and tests. Replaced deep relative and `@parel/ui/atoms` Icon imports with `@parel/ui`. Replaced direct hook imports (`@/lib/hooks/useUserSummary`, `useFeatureGate`) with `@/lib/hooks` barrel. Jest `moduleNameMapper` updated for `@parel/db/client`.
  - **Logger consolidation:** `apps/web/lib/logger.ts` now re-exports from `@parel/core/logger`. `packages/core/utils/debug.ts` delegates to canonical logger; keeps `perfStart`, `debugIf`, `testLog`, `logApi`, `logQuery` for backward compat. `instrumentation.ts` Redis status uses `logger.info` instead of `console.log`. ESLint `no-console: warn` already in place.

## [0.47.01] - 2026-03-09

### Added
  - **Config unification (#57):** Single entrypoint `@parel/core/config/unified` for all config. Extended unified config schema with `AppMetaConfig` (version, name, features, feedback, stripe, qgen, scheduler). `apps/web/lib/config.ts` now bridges from unified config—calls `ensureUnifiedConfigInitialized()` and re-exports from `getConfig('app').meta`. No module maintains its own config copy; env vars read only in ConfigManager.applyEnvironmentOverrides.
  - **ESLint setup:** Root `.eslintrc.json` with next/core-web-vitals, react-hooks rules (error/warn), @typescript-eslint/no-unused-vars, no-console. Root package.json: eslint + eslint-config-next devDeps. apps/web config already had hook rules; root config enables monorepo-wide lint baseline. Prevents runtime errors like "useEffect is not defined".
  - **useUserSummary hook:** Shared `lib/hooks/useUserSummary.ts` as canonical frontend source for gameplay stats (level, xp, progress, funds, diamonds, streakCount, questionsAnswered). Uses SWR + `/api/user/summary`; subscribes to `xp:update` for revalidation; no fake Lv1/0 XP before load.
  - **Changelog page improvements:** Filtering (search, month, type), month grouping, summary sidebar. API extends entries with `month`, `year`, `counts`. Client-side filters: searchText, selectedMonth, selectedType. ChangelogSummary component shows totalVersions, totalAdded, totalFixed, totalChanged, last update. Layout: filters + content + sidebar; sidebar collapses under content on small screens.

### Changed
  - **Navbar, profile, and dashboard unified under useUserSummary:** All three surfaces now use `useUserSummary()` as the canonical source for level, xp, and progress. Profile StatsPanel migrated from `/api/progression/stats` (level/xp) to the hook; still fetches progression API for stats (str/int/cha/luck) and archetype only. Added `getXpProgressDetail(xp)` in lib/xp as single progress calculation shared by all consumers. No fake Lv1 or 0 XP before load.
  - **Navbar XpBar and main dashboard:** Both use `useUserSummary()` instead of duplicate fetches. XpBar shows loading skeleton until data loads; MainPage uses hook data for hero, XP card, Level progress card. Session kept for auth only; progression comes from DB-backed summary.
  - **Changelog page styling:** Dark background (min-h-screen bg-bg) and card colors (bg-card, border-border) aligned with other pages.
  - **Changelog page dark theme fix:** Explicit slate palette (bg-[#0f172a], bg-slate-800, border-slate-600, text-slate-100) so page stays dark regardless of app theme. Protection banner uses amber-950/30 for dark mode.

### Fixed
  - **ensureUnifiedConfigInitialized is not a function:** Added typeof guard in providers.tsx to avoid runtime crash when export fails to resolve; logs warning instead. Added root predev script to build @parel/core before dev.
  - **packages/db TS6307:** tsconfig.json used explicit `include` list that omitted opsRun.ts and feedbackConstants.ts. Replaced with `["index.ts", "src/**/*.ts"]` so all src files are included. Excluded src/seed.ts (schema drift) to restore build; pnpm dev now passes.
  - **DEV crash: ensureUnifiedConfigInitialized is not a function:** Verified dist/config/unified.js exports ensureUnifiedConfigInitialized; source packages/core/config/unified.ts has named export. Fixed providers.tsx: (1) all imports first, no calls before imports; (2) import from @parel/core/config/unified; (3) sync init after imports + UnifiedConfigBoot (useEffect fallback); (4) temp console.log sanity check. Clear .next cache and rebuild core to resolve stale bundling.
  - **Sigil runtime crash:** `generateSigilHeatmap` in `@parel/core` could throw on invalid input. Root cause: invalid/missing `buckets` (non-array or length ≠ 56) or undefined `seed`. Added defensive guards: throw explicit error when `buckets` is not an array; normalize `buckets.length !== 56` to 56 with zeros; default `seed` to `"anonymous"` when null/undefined. Function always returns `{ svg: string }`. No browser APIs; safe for SSR.
  - **generateSigilHeatmap is not a function:** Barrel import from `@parel/core` failed at runtime. Added dedicated export path `@parel/core/sigils/heatmap`. Sigil.tsx now imports from that path. Unit test `sigilHeatmap.test.ts` asserts `typeof generateSigilHeatmap === 'function'` to prevent regression.
  - **Unified config not initialized:** `getUnifiedConfig()` threw on Achievements and other pages when `useRewardToast`/`getUiConfig` ran before init. Root cause: `initUnifiedConfig()` was never called. Added `ensureUnifiedConfigInitialized()` (idempotent) in `@parel/core/config`. Bootstrap: (1) `instrumentation.ts` (Node) calls it at server startup; (2) `app/providers.tsx` calls it at module load (SSR + client). Entrypoint: `Providers` wraps the app and loads before any route; instrumentation runs before first request. Unit test `unifiedConfig.test.ts` verifies init.
  - **ensureUnifiedConfigInitialized is not a function:** Barrel `@parel/core/config` did not export it at runtime. Added dedicated export path `@parel/core/config/unified`. providers.tsx and instrumentation now import from that path. Fixed import order: all imports first, then init call. Export map: `"./config/unified": { types, import, require, default }`.
  - **useEffect is not defined (main page):** Main page used `useEffect` without importing it from React. Added `useEffect` to the React import.
  - **Changelog body text not rendering:** Parser required `line.startsWith("- ")` but changelog uses `  - ` (leading spaces). Switched to regex `^\s*-\s+(.*)$` to match bullets with optional leading whitespace. Page now renders section items; summary counts reflect parsed arrays.


## [0.46.20] - 2026-03-03

### Added
  - **DEV-ONLY Schema drift guard:** `packages/db/src/dev/schemaGuard.ts` – `validateSchema()` checks users.starterFlowCompletedAt, feedbackRewardClaimed, isBeta. Wired in `instrumentation.ts` (Node runtime, APP_ENV=dev only). On missing column: throws "SCHEMA DRIFT DETECTED: missing column users.X. Run pnpm prisma:migrate:deploy". On OK: "[SchemaGuard] Prisma schema validated (dev)".

### Fixed
  - **SchemaGuard:** Prisma.join() with string array produced invalid SQL for PostgreSQL IN clause. Switched to $queryRawUnsafe with constant IN list (safe: compile-time values only).
  - **DEV Prisma schema drift:** `users.starterFlowCompletedAt` column missing. Root cause: migration `20260302120000_starter_flow_alpha` existed in packages/db/migrations but had not been applied. Ran `pnpm prisma:migrate:deploy` (tsx db-migrate-deploy) to apply 5 pending migrations including starter_flow_alpha.
  - **Diagnostic script:** db-diagnose.ts (DATABASE_URL, migrate status).

### Migration status
  - Prisma uses packages/db/migrations (same dir as schema.prisma). Column confirmed in DB.

## [0.46.19] - 2026-03-02

### Added
  - **Alpha Contributor badge:** When user completes Alpha Feedback – v0.1 and reward is granted, also grants badge ALPHA_CONTRIBUTOR (UserBadge + badgeType for header).
  - **Badge mechanism (reused):** Badge table + UserBadge; User.badgeType for header; seedBadges.ts / ensureAlphaFeedbackPoll; UserBadge component (badgeConfig).
  - **Badge key granted:** ALPHA_CONTRIBUTOR (no existing CONTRIBUTOR; minimal metadata, no levels).
  - **Granting:** Single place in /api/polls/respond; idempotent (check hasBadge before create); no duplicate rows.
  - **Completion message:** "Thanks. Reward claimed and badge unlocked."
  - **Rewarded Feedback flow:** Alpha testers get XP + coins for completing the Alpha Feedback poll pack after Starter Flow.
  - **User fields:** `feedbackRewardClaimed` (Boolean, default false), `isBeta` (Boolean, default false). Migration `20260302210000_user_feedback_reward`.
  - **Config:** `FEEDBACK_REWARD_XP = 100`, `FEEDBACK_REWARD_COINS = 50`, `FEEDBACK_ENABLED` (env: FEEDBACK_ENABLED or NEXT_PUBLIC_FEEDBACK_ENABLED).
  - **Poll completion hook:** When user completes all 5 polls in alpha-feedback-v01 pack, grants XP + coins once, sets `feedbackRewardClaimed = true`. No per-poll XP for alpha pack.
  - **Feedback prompt modal:** After Starter Flow completion: "Help shape Parel" / "1-minute feedback. Earn 100 XP + 50 coins." [Give feedback] [Maybe later]. SessionStorage dismiss; shows again next login until completed.
  - **/feedback/alpha:** 5-question wizard for Alpha Feedback pack. Optional freetext questions allow skip.
  - **Admin Alpha Feedback:** `/admin/feedback` – rewards granted count, % completion (vs starter-completed), distribution per option, freetext responses.
  - **Alpha Tester Feedback Pack:** Internal poll pack for first testers. Poll model supports `packKey`; migration `20260302200000_public_poll_pack_key`.
  - **Alpha Feedback – v0.1:** Structured 5-question poll pack: (1) "Did you understand what to do?" (single choice), (2) "What was the best moment?" (single choice), (3) "Would you come back tomorrow?" (single choice), (4) "What confused you the most?" (free text, optional), (5) "Complete this sentence: Parel is..." (free text, optional).
  - **ensureAlphaFeedbackPoll:** Idempotent seed script in packages/db/scripts; packKey `alpha-feedback-v01`. Seeded via db:seed:world (runSeedWorld).
  - **GET /api/polls?packKey=:** Filter polls by pack key; returns polls ordered by createdAt asc for wizard flow.
  - **Sigil v0.1 (heatmap):** Mirrored 7×8 heatmap profile flag based on recent activity (answers per day, last 56 days). Real data from user_responses; deterministic placeholder from userId+createdAt when no activity.
  - **getUserActivityBuckets(userId):** Returns `{ buckets: number[], placeholder: boolean }`; intensity 0–4; GET /api/user/activity-buckets (auth required).
  - **generateSigilHeatmap({ buckets, seed }):** packages/core; 7 rows × 8 cols, horizontal mirror, 5-level palette, viewBox scaling.
  - **Sigil.tsx:** Props userId, size (sm|md|lg), onClick, expandOnClick; fetches activity, renders SVG; placeholder hover: "New profile, sigil will evolve with activity."; click opens Dialog (large view).
  - **Integration:** Small Sigil in profile header (lg, expandable) and ProfileMenu top bar (sm, expandOnClick=false).
  - **Profile Sigil (MVP):** Deterministic 5x5 SVG sigil from user stats via `generateSigil(userId, stats)` in @parel/core (mirrored grid, small fixed palette, primary/border color buckets).
  - **Profile UI:** `ProfileSigil` component and integration on `/profile` header (recomputed from `/api/user/summary`, no storage or DB change).
  - **Leaderboard:** Small sigil in `PhotoLeaderboard` rows derived from entry scores (no extra requests).
  - **API:** `/api/profile/[id]/sigil` returns SVG for a given user (stats derived from level/karma/questions/streak, cacheable).
  - **OpsRun schema:** entityType, entityId, entityLabel, params (Json), warnings (Json, cap 20), errorStack (String, cap 4000). Migration 20260302180000 in both migrations folders.
  - **Standardized counts:** finishOpsRun normalizes counts to scanned, created, updated, skipped, failed, warnings (default 0).
  - **Wiki enrich / QuestionGen:** Structured counts and params; entityType/entityId/entityLabel for QuestionGen; errorStack on failure.
  - **Admin Ops list:** Client-side filter by type and status; status badges (success/failed/running); entityLabel as secondary line.
  - **Admin Ops detail:** Params JSON (pretty); warnings list (first 20); errorStack in collapsible details block.

### Changed
  - createOpsRun accepts optional entityType, entityId, entityLabel, params.

## [0.46.13] - 2026-03-02

### Added
  - **OpsRun progress tracking:** OpsRun model for internal bots (Question generator, Wiki enrichment). Tracks type, status, duration, counts, message, reportPath.
  - **packages/db:** OpsRun schema + migration (20260302170000). `createOpsRun`, `finishOpsRun` service.
  - **Wiki enrich:** Creates OpsRun at start, finishes on success/fail with counts + reportPath.
  - **QuestionGen processor:** Creates OpsRun per job, finishes on success/fail with counts.
  - **Admin UI:** `/admin/ops` table of last 50 runs; `/admin/ops/[id]` detail. GET /api/admin/ops, GET /api/admin/ops/[id] (admin only).

### Changed
  - Admin dashboard: Ops Runs card linking to /admin/ops.
  - Sidebar nav: Ops Runs link for admins.

## [0.46.12] - 2026-03-02

### Added
  - **WikiBot (tortoise) enrichment:** scripts/wiki-enrich.ts maps FlowQuestions to Wiki Seeds. Batch mode (--limit=10). Produces docs/wiki-enrich-report.md.
  - **FlowQuestion wiki fields:** wikiFillCandidate, worldContextKey, worldContextRegionPolicy, worldContextLabel. Migration 20260302160000.
  - **pnpm wiki:enrich:** Runs enrichment (dev env). pnpm wiki:report: prints report path.
  - **Wiki Seeds keys:** sleep_hours_avg, screen_time_hours_avg added to getWorldContext (placeholder values).
  - **Report per-question world context:** When question.worldContextKey exists, renders "<label> (<year>): <value> <unit> (sourceName)". Uses region from policy (userRegion | fixed:CZ | global).
  - **Starter questions:** ensureStarterFlow sets wikiFillCandidate=true (new + existing).

### Changed
  - Report API: worldContextRows built from each question's worldContextKey; region resolved via worldContextRegionPolicy.

## [0.46.11] - 2026-03-02

### Added
  - **World Context (Wiki Seeds):** Static, versioned real-world reference data (e.g. CZ avg income). No DB, no runtime fetches.
  - **packages/core/src/world/wiki-seeds/cz.json:** Minimal schema + 1 placeholder entry (income_monthly_avg).
  - **getWorldContext(region, key):** Loader in packages/core; exported from @parel/core.
  - **Report World Context row:** Optional "CZ average (2024): 75,000 CZK" on Summary/Report when region=CZ and data exists. Behind ENABLE_WORLD_CONTEXT_ROW.
  - **Single source of truth for Redis:** `packages/redis` env (REDIS_URL, REDIS_DISABLED, hasRedis) and `getRedisClient()`. In dev, REDIS_URL unset => Redis disabled by default.
  - **checkPresenceRateLimit:** Implemented in lib/security/rateLimit (5 req/20s per IP) for presence/ping.
  - **Startup Redis status:** Dev-only log "Redis: enabled" or "Redis: disabled (no REDIS_URL)" at server start.
  - **No-op connection proxy:** queue/connection returns no-op when Redis disabled; workers exit gracefully.

### Fixed
  - **Direct ioredis creation removed** from: realtime.ts, broker.ts, queue/connection.ts, queue.ts, jobs/index.ts, queue/questionGenQueue.ts, jobs/questionGen.queue.ts, culturalFilter.ts, ai/context.ts, performance/cache.ts, events/join/route.ts, queue-config.ts, scheduler.worker.ts, questionGen.worker.ts. All use `getRedisClient()` from @parel/redis.
  - **checkPresenceRateLimit missing:** presence/ping now uses proper rate limit (was broken import).
  - **Edge runtime:** env hasRedis computed locally to avoid pulling ioredis into Edge (health route).
  - **REDIS_URL default:** No fallback to localhost in dev; unset => disabled.

### Changed
  - events/today, presence: use getRedisClient/hasRedis from @parel/redis.
  - queue-config createQueue: returns null when Redis disabled; getAllQueueStats returns [].
  - instrumentation.ts: logs Redis status on Node.js server start.

## [0.46.09] - 2026-03-02

### Added
  - **Redis optional in dev:** Redis is no longer required for local development. Set `REDIS_DISABLED=true` to run without it. No unhandled error events or log spam when Redis is unavailable.
  - **Env gate:** `REDIS_DISABLED` (boolean) and `REDIS_URL` (string). If `REDIS_DISABLED=true` or `REDIS_URL` is missing/empty, app uses in-memory fallback instead of ioredis.
  - **In-memory fallback:** `packages/redis` exports `memoryAdapter` (get/set/del with TTL) for cache/locks when Redis is disabled. Rate limit / locks return permissive behavior in dev.
  - **logOnce utility:** Connection errors logged at most once per process start to reduce spam.

### Fixed
  - **ioredis unhandled error:** Client now has `client.on("error", ...)` so connection failures (e.g. ECONNREFUSED) do not crash the process.
  - **smoke:web without Redis:** Smoke script sets `REDIS_DISABLED=true` when `REDIS_URL` is not provided, so smoke passes without a local Redis.

### Changed
  - **Presence / events:** Use centralized `@parel/redis` client instead of creating own ioredis instances.
  - **prod validation:** `REDIS_URL` not required when `REDIS_DISABLED` is set.

### Docs
  - docs/COMMANDS.md: Note that local Redis is optional; `REDIS_DISABLED=true` to run without.

## [0.46.08] - 2026-03-02

### Fixed
  - **useFeatureGate crash:** Hook now never throws. Early return when status !== "authenticated" or !session?.user with { allowed: false, message: "Sign in required." }. Safe mapper `mapSessionUserToGateUser` with defaults (level:1, isBeta:false). Try-catch around canAccessFeature. Does NOT read isPremium from session.
  - **canAccessFeature null-safety:** Falsy user returns { allowed: false, message: "Sign in required.", reason: { custom: { message: "Sign in required." } } } instead of proceeding with rule logic.
  - **Prisma User.isPremium error:** Removed isPremium, premiumUntil from auth JWT select (User model has no such fields). Session/token still include isPremium: false for compatibility; premium gating is TODO.
  - **premiumCheck.ts:** Stub returns false (no Prisma select). lib/season/service.ts: premium track always returns "Premium subscription required" until schema adds entitlement.
  - **RegionSelector crash (main page):** Replaced RegionSelector (placeholder returning null) with FooterLocaleToggle. Region/Language selector source: `@/components/FooterLocaleToggle` (uses `@/lib/i18n/useLocale`).
  - **main page ReferenceErrors:** Added lucide-react imports for AlertCircle (Unable to Load Profile EmptyState) and Trophy (No Achievements Yet EmptyState).
  - **canAccessFeature import error:** Added dedicated export path `@parel/core/config/featureGates` in packages/core package.json. useFeatureGate, FeatureGate, and tests now import from that path instead of `@parel/core/config` barrel.
  - **DEEP_REPORT gate:** Now level-only (level 5). Premium gate deferred until User.isPremium exists in schema.

### Added
  - **Unified feature lock system:** Centralized gate mechanics for UI features. `packages/core/config/featureGates.ts`: FeatureKey union (FLOW_BROWSER, CATEGORIES, RPG, DEEP_REPORT, INVITE, MARKETPLACE), LockReason types (level, premium, admin, beta, custom), `canAccessFeature(user, featureKey)` with message and priority (admin > premium > beta > level > custom).
  - **useFeatureGate(featureKey) hook:** `apps/web/lib/hooks/useFeatureGate.ts` - reads session (level, role, isPremium); SSR-safe; returns { allowed, message, reason }.
  - **FeatureGate component:** `mode="hide"` renders nothing when locked; `mode="placeholder"` renders lock affordance with tooltip. Uses existing Tooltip + Lock icon.
  - **Session includes level:** JWT/session now carries `level` for client-side gate checks without extra fetches.

### Changed
  - **NavLinks:** Arena (RPG) and Invite Friends use FeatureGate. Arena: placeholder when level < 3. Invite: disabled dropdown item with lock + tooltip when level < 3.
  - **Auth:** JWT and session callbacks add `level` from DB.

### Feature gates (initial rules)
  | Feature     | Unlock rule                 |
  |------------|-----------------------------|
  | FLOW_BROWSER | Level 3                    |
  | CATEGORIES   | Level 3                    |
  | RPG          | Level 3                    |
  | DEEP_REPORT  | Level 5 or Premium         |
  | INVITE       | Level 3                    |
  | MARKETPLACE  | Level 5                    |

### Tests
  - Unit test `tests/featureGates.test.ts` for canAccessFeature priority and messages.

## [0.46.07] - 2026-03-02

### Added
  - **Alpha Starter Flow (single canonical):** `STARTER_FLOW_SLUG="starter"` constant. Seed (`db:seed:world`) ensures idempotent starter category with `isStarter`, `visibleInBrowse=false`, 5 curated questions. First: "Have you ever met a ghost?"; others: sleep, phone time, spending, fate. Category metadata: `isStarter=true`, length 5, `visibleInBrowse=false` until Level 3.
  - **Onboarding routing (Level 3 gate):** First Play/flow run forces STARTER flow (no selection UI). Flow selection (categories/browse) unlocked at level >= 3 or when starter completed. `DEV_UNLOCK_FLOWS=1` skips gate. `getAvailableCategories(userId)` applies gate.
  - **Report/Summary screen (Option A - You vs The World):** After finishing starter flow: headline ("You are more X than Y% of players"), subheader ("Based on N responses"), 3 comparison rows (You vs Global synthetic stats), identity hint ("You are trending toward: The Curious Realist"), unlock note. CTAs: Continue, Back to Home. No economy, inventory, RPG, or technical stats.
  - **Synthetic comparison stats:** `getSyntheticGlobalStats(questionId, type, userAnswer)` deterministic per day; non-round numbers; stable N. Service in `lib/services/syntheticStats.ts`. `formatHours()` for numeric display.
  - **Storage:** `users.starterFlowCompletedAt` (nullable) set when starter report shown. POST `/api/flow/starter-complete` records completion.
  - **APIs:** GET `/api/flow/report?categoryId=` returns Option A payload. GET `/api/flow/categories` respects Level 3 gate via session.

### Changed
  - **flow-demo:** Single starter category auto-starts (no selection UI); shows "Starting your flow..." during launch. Result step shows Option A report when starter flow completed; otherwise legacy "Flow Complete!" with answered/skipped/XP grid.
  - **Seed:** `ensureStarterFlow()` in ensureBaselineData; runSeedWorld invokes it. Idempotent upsert of starter questions.

### Models / Schema
  - User: `starterFlowCompletedAt` (DateTime?)
  - SssCategory: `slug`, `isStarter`, `visibleInBrowse`

## [0.46.06] - 2026-03-02

### Added
  - **Safe deploy command:** `pnpm deploy` runs validate, then git add/commit/push. Aborts if validate fails. Vercel builds from Git. scripts/deploy.ps1.
  - **Tiny human command surface:** validate = big hammer (PASS/FAIL summary, fail-fast). scripts/validate.ps1 runs check:dev-sanity, typecheck, test, smoke:web, smoke:flow; optional e2e:local if RUN_E2E=true. scripts/daily.ps1: optional kill, then dev. docs/COMMANDS.md explains each command and underlying scripts. Root scripts: kill, daily, validate now invoke PowerShell scripts.
  - **Human-owned command list:** docs/COMMANDS.md is now minimal (2 commands per topic): daily, kill, validate, smoke:web, db:reset:world, db:seed:world, build:web, start:web. Full reference moved to docs/COMMANDS.full.md. New scripts: `daily` (= dev), `kill` (= kill-port 3001), `validate` (check:dev-sanity + typecheck + test, skips missing), `start:web` (prod mode port 3011), `help` (prints docs path). kill:3001 kept as alias of kill.
  - **Documentation gate for commands:** If any package.json scripts change (root, apps/web, packages/db), docs/COMMANDS.md must be updated in the same commit. `scripts/check-command-docs.mjs` computes a sha256 hash of script names and compares it to `<!-- commands-hash: ... -->` in docs/COMMANDS.md. `scripts/update-command-docs-hash.mjs` updates the marker. Root scripts: `pnpm check:command-docs` (gate), `pnpm docs:commands:update` (refresh). Wired into `check:dev-sanity`.
  - **scripts/kill-port.ps1:** Kill process(es) owning a TCP port. Usage: `.\scripts\kill-port.ps1 -Port 3001`.
  - **pnpm kill:3001:** Root script to free port 3001.
  - **docs/COMMANDS.md:** Canonical command reference with Daily / Recovery / DB / Release / Utilities grouping.

### Changed
  - **Script normalization:** Normalized root package.json scripts; no hardcoded Prisma --schema; scoped builds via `pnpm --filter`.
  - **build:web:** Now `pnpm --filter @parel/web... run build` (was `cd apps/web && pnpm run build:web`).
  - **typecheck:** Now `pnpm --filter @parel/web run typecheck` (was `cd apps/web && pnpm run typecheck`).
  - **prisma:generate:** Now `pnpm --filter @parel/db run prisma:generate` (uses package config).
  - **prisma:db:pull:** Now `pnpm --filter @parel/db exec prisma db pull` (uses package config).
  - **test:smoke:** Now alias of `pnpm smoke:flow`; deprecated in favor of `smoke:flow` or `smoke:web` per use case.

## [0.46.01] - 2026-03-01

### Added
  - **Alpha baseline seed contract:** docs/seed-baseline.md defines minimal invariants. ensureBaselineData(prisma) enforces: (1) admin user, (2) 4 RPG enemies, (3) 3 items, (4) flow category hierarchy, (5) 1 flow question. Idempotent; invoked early by runSeedWorld. Stops seed whack-a-mole on empty DB.
  - **RPG DLC gating + multi-character + Play enablement:** RPG is DLC-like enhancement on core Questions/Comparison app. Schema: User fields `rpgEnabled`, `rpgCreatedAt`, `rpgPromptSeenAt`, `rpgDismissedAt`, `activeCharacterId`; new `Character` model (userId, type, name); `CharacterEquipment` (characterId, slot, inventoryItemId). Eligibility: level >= 3 && answeredToday >= 5; users can create character anytime. API: GET `/api/rpg/status` (eligible, rpgEnabled, hasCharacter, activeCharacterId, shouldPromptCreate), POST `/api/rpg/dismiss`, `/api/rpg/enable`, `/api/rpg/disable`, POST `/api/rpg/character/create` (type, name?), POST `/api/rpg/character/set-active` (characterId). Play page: CreateCharacterGate when no character (inline class selector: mage, paladin, warrior, rogue, cleric); Enable RPG CTA when disabled. Arena link moved from admin extras to main nav for all logged-in users.
  - **Inventory unification (alpha canonical stash = UserItem):** CharacterEquipment now supports `userItemId` (canonical) and `inventoryItemId` (legacy fallback). Migration `20260301130000_character_equipment_user_item` adds userItemId FK to UserItem, makes inventoryItemId nullable. New service `equipCharacterItem(userId, characterId, slot, userItemId)` and `unequipCharacterSlot(userId, characterId, slot)`. New API: GET `/api/rpg/equipment?characterId=`, POST `/api/rpg/equipment/equip` (characterId, slot, userItemId), POST `/api/rpg/equipment/unequip` (characterId, slot). Read path: resolve userItemId first, inventoryItemId fallback. RPG loot: combatService and rewardsEngine now use `addItemToInventory` (UserItem) instead of `createInventoryItem` (InventoryItem). No new inventory tables added.

### Changed
  - **Seed:** ensureBaselineData runs first; seed-world adds fuller content. Alpha baseline only—use feature bootstrap for deeper data.
  - **Migration sync (prisma vs packages/db):** Added migrations to packages/db/migrations/ for schema already in packages/db/prisma/migrations/ so deploy applies correctly: users.birthYear (20260301140000), users.lastNewsSeenAt (20260301150000), flow_questions.challengeEnabled (20260301160000), daily_charms + user_daily_charms (20260301170000), roadmap_items + roadmap_votes (20260301180000), milestone_rules + milestone_deliveries (20260301190000). All seed scripts now set birthYear: 1990 on users. OAuth and test-login user creation also set birthYear.
  - **Play (Arena) admin gate removed:** `/play` no longer requires admin. NavLinks shows "Arena" in main nav for all authenticated users. Play page gates: no character → Create character flow; rpgEnabled false → Enable RPG button. Core flow unaffected when RPG APIs fail.
  - **Canonical stash = UserItem:** `/api/inventory` and user-facing inventory use UserItem. RPG equipment uses UserItem via CharacterEquipment.userItemId. InventoryItem is legacy; read fallback only. TODO: remove InventoryItem after Alpha.
  - **RPG inventory stabilization (InventoryItem read-only for RPG):** POST `/api/rpg/equip` now accepts `{ characterId, slot, userItemId }`; back-compat: `inventoryItemId` maps to UserItem via (userId, itemId) or returns "Legacy item cannot be mapped; re-add item to stash". POST `/api/rpg/unequip` accepts `{ characterId, slot }`; back-compat: `inventoryItemId` finds CharacterEquipment and clears. equipItem/unequipItem deprecated (throw); no InventoryItem writes from RPG. getTotalItemPower/applyItemEffects: dual-read—CharacterEquipment.userItemId (active character) first, InventoryItem fallback. createInventoryItem: dev-only warn when called. Verified: no RPG endpoint creates/updates InventoryItem.

### Models reused
  - User (added RPG fields), UserItem (canonical stash), Item. CharacterEquipment extended with userItemId. InventoryItem legacy; CharacterEquipment.inventoryItemId kept for backwards compat.

### TODOs
  - Remove InventoryItem after Alpha. Inventory UI (equipment loadout), prompt modal for shouldPromptCreate, profile settings toggle for rpgEnabled, character switcher when >1 characters.

## [0.45.26] - 2026-02-27

### Fixed
  - **Prisma generate zod warning:** zod-prisma-types could not determine zod version when running from monorepo root — "Falling back to default 4.0.0" warning. Added `zod` as root dependency so the generator can resolve it; warning should be eliminated or reduced.
  - **Prisma migrate deploy DATABASE_URL error:** `prisma:migrate:deploy` failed with "Environment variable not found: DATABASE_URL" because it ran Prisma directly without env loading. Project uses `DATABASE_URL_DEV` / `DATABASE_URL_PROD` via APP_ENV, not DATABASE_URL directly. Created `packages/db/scripts/db-migrate-deploy.ts` — loads .env via `_loadEnv`, sets `DATABASE_URL` from `resolveDatabaseUrl` (DATABASE_URL_DEV when APP_ENV=dev, DATABASE_URL_PROD when prod), then runs `prisma migrate deploy`. Root script `prisma:migrate:deploy` now invokes this tsx script instead of calling Prisma directly. Migrate deploy works in both dev and prod (set APP_ENV=prod and DATABASE_URL_PROD for production).

### Added
  - **db-migrate-deploy.ts:** Wrapper script for `prisma migrate deploy` that loads env files (root .env, .env.local, apps/web/.env, apps/web/.env.local) and resolves DATABASE_URL from DATABASE_URL_DEV or DATABASE_URL_PROD before invoking Prisma. Ensures migrations run correctly regardless of which env vars are defined.

>>>>>>> ec7f2b9 (vercel build fix 4.6.2026)
## [0.45.25] - 2026-02-27

### Fixed
  - **Disabled observability in dev via DISABLE_OBSERVABILITY flag to speed up dev build:** Added `lib/observability/isObservabilityEnabled.ts` — returns false when `DISABLE_OBSERVABILITY=true` or `NODE_ENV=development`. Gated: `instrumentation.ts` (server Sentry), `instrumentation-client.ts` (client Sentry; dynamic import when disabled), `lib/sentry/client-config.ts` (initSentry, captureError, setUserContext; dynamic import), `next.config.js` (withSentryConfig only when observability enabled). ErrorBoundary uses isObservabilityEnabled. Dev: observability off by default; prod: unchanged.

## [0.45.24] - 2026-02-27

### Fixed
  - **Removed duplicate JS pages shadowing TS versions:** Deleted 1 duplicate: `app/profile/combat-log/page.jsx` (kept page.tsx; added minimal default export to complete truncated TS file). Scope: app/**, pages/**, middleware. No API route duplicates found (check:routes already clean). Skipped: none (combat-log TS was incomplete; fixed before deletion).

### Added
  - **check:page-duplicates:** Script `scripts/check-page-duplicates.mjs` — scans app/ (excl. api) and middleware for page.jsx+page.tsx, layout.jsx+layout.tsx, etc. Fails on duplicates. Wired into `pnpm check:dev-sanity`.
  - **remove-js-duplicates.mjs:** One-time cleanup script (scoped to route files in app/, pages/, middleware). Validates TS has export before deleting JS.

## [0.43.4] - 2026-02-05

### Fixed
  - Next build root causes (fix by layer, no import changes in apps/web): (1) **Export order**: packages/core/package.json `./hooks/useRealtime` had `default` condition not last — Node/Next require default last; moved `default` to end so "Module not found: Default condition should be last one" (app/providers.tsx) is resolved. (2) **@parel/redis resolution**: next.config.js added `resolve.alias['@parel/redis']` to packages/redis and `@parel/redis` to transpilePackages so core config/cache can resolve @parel/redis. Build now completes (exit 0); remaining warnings: Attempted import errors from @parel/features/flow, @parel/core/config/flags, @parel/story (package exports/stubs), plus Prisma/OpenTelemetry/Sentry managed-path warnings. See web-build-errors-summary.txt.
  - Turbopack disabled for dev: Turbopack (`--turbo`) caused dev-only module resolution failures for @parel/core/hooks/* despite green build and working Node require.resolve. Dev now runs via webpack (plain `next dev -p 3001`). Disabled due to monorepo + package-exports resolver issues; revisit when Turbopack improves. Goal: stable dev for testing/screenshots.
  - Vercel deploy builds only @parel/web: Avoid recursive monorepo builds (root `pnpm build` = `pnpm -r run build`) on Hobby. Prefer **Root Directory** = `apps/web` with Install `pnpm install --frozen-lockfile`, Build `pnpm run build`. If root must stay repo root: Install `pnpm -w install --frozen-lockfile --filter @parel/web...`, Build `pnpm --filter @parel/web run build`. Do not use repo-root `pnpm build`.
  - Attempted import errors (package-layer fixes): (1) **@parel/features/flow**: Removed next.config.js alias so resolution uses @parel/features package exports (./flow → ./flow/index.ts); fixed packages/features/flow/flow-skeleton.ts syntax (missing `}` closing `data` in prisma.user.update). (2) **@parel/core/config/flags**: packages/core/package.json `./config/flags` export reordered with `types`, `import`, `require`, `default` (default last). (3) **@parel/story**: storyCollectionService and storyTemplateService exports now point to src (./src/storyCollectionService.ts, ./src/storyTemplateService.ts) so getPublicCollections and getPublicTemplates resolve; added @parel/story to transpilePackages. (4) **@parel/db** for flow: next.config.js aliases added for `@parel/db` (packages/db) and `@parel/db/client` (packages/db/src/client.ts) so flow-skeleton resolves @parel/db without breaking @parel/db/client. Build completes (exit 0); optional remaining: getFlags warnings in some routes.

