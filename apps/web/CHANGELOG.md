<!-- version-lock: true -->


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
