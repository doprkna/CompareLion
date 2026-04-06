# Alpha Baseline Seed Contract

## Purpose

Stable dev/test initialization. Ensures minimal invariants exist so the app does not crash on empty DB.

## Rules

1. **Seed must be idempotent** — Running seed multiple times produces no duplicates; safe to re-run.
2. **Seed creates minimal invariants only** — No deep content, no simulation.
3. **Empty-state UX required** — Where baseline is not guaranteed, UI must handle empty data.
4. **Feature-specific data is lazy** — Deeper data created on first use (bootstrap), not in seed.

## Baseline Invariants

| # | Invariant | Models | Notes |
|---|-----------|--------|-------|
| 1 | At least one admin user exists | User | `admin@example.com` for login/dev |
| 2 | Minimal RPG enemies exist | Enemy | 3 common + 1 boss; Arena needs enemies to start fights |
| 3 | Minimal item catalog exists | Item | 3 items (weapon, armor, trinket); inventory/equip assume catalog |
| 4 | Flow category hierarchy | Category, SubCategory, SubSubCategory, SssCategory | ROOT → Flow → 1 leaf; questions require hierarchy |
| 5 | At least one flow question | FlowQuestion | One question so Flow tab does not crash |

Do **not** add: RPG progress per user, combat sessions, drops, skill trees, hundreds of questions/posts.

## Implementation

- `ensureBaselineData(prisma)` — Idempotent; returns `{ created: string[]; skipped: string[] }`.
- Invoked early by main seed entrypoint.
