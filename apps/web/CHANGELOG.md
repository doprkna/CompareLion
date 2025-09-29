# Changelog
All notable changes to this project will be documented here.  
Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).  

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