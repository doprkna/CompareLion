# PareL — Post-v0.22.1 Roadmap Draft

## 🎯 Objective
Define direction for v0.23+ development after public beta stabilization.  
Split roadmap into three tracks: Foundational (tech health), Creative (features & UX), and Operational (team & delivery).

---

## 🧩 Foundational Track — v0.23.x
Goal: reduce technical debt, improve maintainability, and prepare for scale.

### 1. Type & Lint Cleanup (v0.23.0)
- Resolve remaining ~200 TypeScript errors.
- Standardize all API return types to unified response helpers.
- Switch all Zod validation to `.issues`.
- Remove unused imports, variables, and console logs.
- Add `npm run clean` script automating ts-prune + eslint fix.

### 2. Background Task Management
- Replace ad-hoc crons with queue system (`bullmq` or Supabase cron).
- Centralize:
  - Weekly reflections
  - Seasonal resets
  - Notification digests
- Logging + retry support for all scheduled jobs.

### 3. Database Optimization
- Add indexes for Leaderboard, Activity, Notification tables.
- Audit schema relations; remove redundant joins.
- Prepare migration scripts for large-scale season resets.

### 4. Testing Framework
- Add Jest/Playwright E2E baseline.
- Cover:
  - Auth
  - Reflection creation
  - Messaging
  - Shop purchase flow
- CI: auto-run tests + lint + typecheck.

---

## 🎨 Creative Track — v0.24.x
Goal: increase user engagement and variety without breaking existing loops.

### 1. Group Comparisons
- Private groups (friends/family/teams).
- Shared leaderboard + reflection stats.
- Invite via code or link.

### 2. Archetypes & Badges
- Expand personality layer: assign "Explorer", "Analyst", etc.
- Unlockable visual badges + seasonal icons.

### 3. Public Polls & Challenges
- Reintroduce "Compare yourself" polls from early drafts.
- Allow creators to post themed challenges.
- Seasonal event linkage (via Season model).

### 4. Chronicle Generator (AI Layer 2)
- Auto-generated "My PareL Chronicle" (weekly/seasonal summary PDF).
- Includes reflections, stats, quotes.
- Local generation first; GPT integration optional later.

### 5. Marketplace Revamp
- Cosmetic rarity tiers.
- Limited seasonal items.
- Dynamic pricing based on participation.

---

## 🧰 Operational Track — v0.25.x
Goal: improve management, monitoring, and creator ecosystem.

### 1. Admin / Creator Tools
- Admin dashboards:
  - Season management
  - Shop editor
  - Analytics view (telemetry aggregation)
- Creator backend:
  - Upload reflection packs
  - Manage polls & challenges
  - Basic revenue tracking (future use)

### 2. Feedback & Reporting
- `/feedback` route for bug reports + logs.
- Store reports in `UserFeedback` model.
- Optional Discord webhook integration.

### 3. Localization
- Add Czech / English i18n structure.
- Localize UI text, reflections, and quotes.

### 4. Data Export & Privacy
- `/account/export` endpoint.
- GDPR-style "Download my data" + delete request handler.

---

## 🧭 Long-Term Concepts (post-v0.25)
- Conversational Reflection Assistant (AI chat add-on).
- PareL "Lite Mode" for low-spec devices.
- Event system for live community challenges.
- Partnerships / API for external integrations.

---

## ✅ Next Steps Summary
1. Start v0.23.0 — **Type & Lint Cleanup + Background Job System**
2. Parallel design work for Group Comparisons (UX sketches)
3. Internal roadmap review and reprioritization before v0.24.x

---

> Cursor, treat this roadmap as directional, not prescriptive. Deliver stability first, delight second, chaos never.

