# Changelog
All notable changes to this project will be documented here.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

⚠️ **Update Rules (read carefully, Cursor!)**
- Do **not** edit or reformat past entries.  
- Always **prepend** new version blocks at the top.  
- Use this structure only:

[x.y.z] - YYYY-MM-DD
Added

- ...

Changed

- ...

Fixed

- ...

- If a section is empty → omit the heading.  
- Preserve indentation and nested bullets exactly as shown in older entries.  
- Never collapse or “clean up” history.  


## [0.3.0] - 2025-10-01
### Added
- UI-first Shop v1
 - Embeded Stripe and created Shop items
 - Shop page layout
 - Tabs: Currency | Cosmetics | My Items | Subscription.
 - Header: balances + buttons.
 - Schema, infrastructure, API etc.
 - Tailwind + shadcn/ui + lucide-react + next-themes are set up.
 - Security & sanity checks
 - Entitlements API
- Equip System
- Subscription mock + drip
- Dark/Light theme
- Bootstrap content factory for questions:
  - Prep the seed list
  - Batch generator job
  - UI for supervision
  - Flow to end-users
  - Control scaling
  - Safety checks
- User auth via Next.js API routes (signup/login) with JWT cookies
- `authUser` middleware for protected endpoints
- Flow runner end-to-end integration test (happy path)
- Seed script for demo data:
  - 10 dummy users (`demo@example.com` + 9 test accounts, all with `password123`)
  - Demo category tree (`Demo Category > Demo SubCategory > Demo SubSub > Demo Leaf`)
  - 3 demo questions under Demo Leaf
- Leaderboard groundwork:
  - `score`, `questionsAnswered`, `questionsCreated` fields in User
  - `Group` + `UserGroup` models for future group leaderboards
- Flow service increments user score + answered count on each answer
- Error handling for Login

### Changed
- User model updated with `passwordHash`, `theme`, and streak fields
- Flow endpoints now require authenticated user
- `answerQuestion` logic transactional with difficulty-based scoring
- Prisma migrations reset into a new `init` baseline for clean schema alignment

### Fixed
- Initial login/signup flow working (test user can access flow)
- Login UI now actually posts to `/api/auth/login` and sets cookie
- Windows EPERM error on Prisma DLL resolved by regenerating client
- Migration drift (`SssCategory` missing) resolved by reset
- Seed script fixed (imports PrismaClient, disconnects on exit)


## [0.2.0] - 2025-09-29
### Added
- CRUD API + auth
- BullMQ + Redis jobs
- DTO serializers
- Refactor & service for API
- Testing framework setup
- Environment Stamp - show if Dev or Prod
 
### Changed
- heavy DB changes for Questions
 - new tables for questions hierarchy
- Refactor & service
  
### Fixed
- many db fixes

## [0.1.3] - 2025-09-19
### Added
- Achievements: award badge after conditions met (first flow, 10 answers)
 - total 15 items.
 - Adde an API route, Returns
 - Create placeholder page
 - Display grid of cards (icon + title + description).
 - No earned/locked logic yet, just list them.

### Changed
- Landing Page (placeholder structure)
  - Hero section: big title + 1-liner (just drop lorem or pitchdeck snippet later).
  - CTA button: “Sign up” (no need to wire up yet).
  - Features teaser: 4 cards (Quiz / Flows / Leaderboard / Shop).
  - Screenshots section: placeholder images (gray boxes).
- Main Page (placeholder structure)
  - Welcome headline: Hello, Username 👋.
  - Latest changelog: call existing API.
  - Quick links grid: 4 cards (Tasks / Questions / Shop / Leaderboard).
  - News box: empty state.
  
### Fixed
- Next.js App Router trap fix for "use client"
- Fixed realtive fetch in server components
- Environment invalid URL fix for Dev
- Server side base fetch fix
  - lib/api used to cover future items

## [0.1.2b] - 2025-09-18
### Added
- Error handling for Changelog.
- API:
  - Parse `CHANGELOG.md` and collect all sections (`### Added`, `### Changed`, `### Fixed`).
  - Return arrays of objects `{ text, children }` for bullets.
  - Support nested bullets.
  - Always return `{ success: true, entries: [...] }` with newest-first order.
- Main Page (`app/main/page.tsx`):
  - Fetch `/api/changelog`.
  - Display the full latest version (show version number + date).
  - Show sections "Added", "Changed", "Fixed".
  - Render all bullets with indentation for children.
  - Remove the old "top 3 bullets" limit.
  - Keep "See all changes" link to `/changelog`.

### Changed
- Changelog Page:
  - Show all versions, grouped the same way.
  - Hide empty sections (don’t render heading if no items).

## [0.1.2] - 2025-09-18
### Added
- Parse headings (`## [x.y.z] - date`).
- Under each heading, collect lists from the `### Added`, `### Changed`, `### Fixed` sections.
- Return JSON with arrays.
### Changed
- `/changelog` page → render those arrays under each version.
- Main page → show latest version + 3 top bullets.
### Fixed
- Fixed version display in footer.
- Fixed changelog on Main Page not displaying.

## [0.1.1] - 2025-09-18
### Changed
- Prisma updated to manage Changelog.
### Fixed
- Fixed Changelog DB behavior.

## [0.1.0] - 2025-09-17
### Added
- Initial version with MVP structure.
- Login & basic auth.
- Changelog system:
  - New `/changelog` page created.
  - Footer version wired to config.
  - Main page “Latest Changes” card added.
### Changed
- Footer version was hardcoded → now dynamic.
### Fixed
- `use client` fix for the pages.

## [0.0.1] - 2025-09-16
### Added
- First deploy of prototype & basic UI skeleton:
  - 13 pages.
  - Language setup.
  - Login/Sign-in setup.
- Versioning:
  - Hardcoded version number in footer.
  - Git, Vercel setup.
- Documentation:
  - README setup.
  - Backlog.
- Authentication.
- Question Bank & Flow.
- Basic security.
### Fixed
- [placeholder, when a bug is fixed]

## [Unreleased]
### Added
- [new features here]
### Changed
- [modifications here]
### Fixed
- [fixes here]