<!-- version-lock: true -->


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
  - **Pipeline smoke test:** `packages/db/fixtures/question-pipeline-smoke.json` + `pnpm db:questions:smoke` validates import → publish → sync → `getNextQuestion` → `answerQuestion`.
  - **Question SoT regression smoke (`pnpm db:questions:smoke`):** locked 15-check pipeline covering import (5 rows), taxonomy link, single publish, FlowQuestion projection + `sourceQuestionId`, Yes/No options, sync idempotency, serve, and answer with optionId.
  - **Real catalog import CLI (`pnpm db:questions:import`):** CSV/JSON/TSV parser with required-column validation, dry-run mode, taxonomy + Question upsert; sample file at `packages/db/fixtures/question-catalog-sample.csv`.
  - **Publish + sync CLI (`pnpm db:questions:publish`):** batch-publish DRAFT/APPROVED questions by `sourceName` (default limit 50), optional `--sync` to project into FlowQuestion; `--dry-run` and HIGH-sensitivity guard unless `--allow-sensitive`.
  - **Admin Question SoT panel:** `GET /api/admin/questions` pipeline status + `POST` sync/archive actions; dashboard panel with counts, warnings, sync button, and archive-by-ID input.
  - **Archive CLI (`pnpm db:questions:archive`):** unpublish Questions to `ARCHIVED`, set `archivedAt`, deactivate linked FlowQuestion (no deletes); dry-run + filters by source/question-id/source-row.
  - **Custom import options:** optional `Options` column (pipe-separated) stored on `Question.metadata.importOptions`; projected to `FlowQuestionOption` on sync; default Yes/No when omitted.
  - **QuestionStats backfill (`pnpm db:questions:stats:backfill`):** materializes `usageCount`/`answerCount`/`reportCount` from linked FlowQuestion runtime data; live increment on `answerQuestion` when `sourceQuestionId` is set.
  - **FlowQuestion serve ledger:** `FlowQuestionServeEvent` records serves from `getNextQuestion`; `QuestionStats.usageCount` from serve events (fallback to `answerCount` only when no serves).
  - **FlowQuestion report ledger:** `QuestionReport` table + `reportFlowQuestion()` service; `POST /api/flow/[id]/report`; `QuestionStats.reportCount` from canonical reports.
  - **FlowQuestion report review (admin):** `GET/PATCH /api/admin/question-reports`; `/admin/question-reports` review page; OPEN count in Question SoT pipeline warnings.
  - **Question pipeline audit trail:** `QuestionPipelineRun` model logs import/publish/sync/archive/stats/report backfill; `/admin/question-pipeline` shows latest 20 runs; last failed run warning on dashboard.
  - **Question pipeline validation gate:** `pnpm validate:questions` runs Prisma validate/generate, smoke, and stats backfill; manual CI workflow `.github/workflows/validate-questions.yml` (ephemeral Postgres, no PR gate).
  - **Question Pipeline foundation panel:** `/admin/question-pipeline` and dashboard embed show foundation status, known limits, and next safe actions (no new docs).
  - **Admin attention signals:** `GET /api/admin/attention` drives needs-attention panel, Admin nav badge, and sidebar dots for question pipeline review items.
  - **Top nav simplification:** single Admin dropdown (with attention badge), account menu (profile / settings / notifications / logout); locale removed from authenticated navbar (Profile → Settings → Language); DEV stamp moved to bottom-left (`DEV • v{version}`); guests keep footer/header locale controls.

### Fixed
  - **Blank page at runtime:** `ThemeProvider` returned `null` until mount (hiding the entire layout tree); `AuthProvider` used `dynamic(..., { ssr: false })` so page content never SSR’d. Theme CSS now defers only `ThemeManager`; `SessionProvider` mounts in `providers.tsx` without SSR skip; `RouteProgress` wrapped in `Suspense`.
  - **Admin dashboard layout:** restructured `/admin` into attention → compact stats (visits/users/messages) → ops row (seeder/ops/audit) → full-width Question Pipeline (summary + actions columns) → action log; `items-start` / `h-fit` cards to avoid empty vertical stretch; denser visit metrics.
  - **Floating locale widget on `/main`:** removed legacy `FooterLocaleToggle` mounted at `fixed top-2 right-2 z-50` on the dashboard; authenticated users change language via Profile → Settings only; guests keep `NavLocaleSelector` (navbar) and `FooterLocaleSection` (footer).
  - **Logout redirect to wrong dev port:** NextAuth resolved `callbackUrl: '/'` against `NEXTAUTH_URL` (default `localhost:3000`) while the web app runs on `3001`; added `signOutToPath()` (client redirect on current origin), `trustHost: true`, and dev URL defaults/examples updated to port `3001`.
  - **Question import metadata typing:** `buildQuestionImportMetadata()` returns `Prisma.InputJsonValue` for `Question.metadata` create/update (fixes `Record<string, unknown>` vs `InputJsonValue` build error).
  - **Projected FlowQuestion Yes/No options:** `syncPublishedQuestionsToFlow()` now seeds default `FlowQuestionOption` rows (Yes/no) for `SINGLE_CHOICE` questions when none exist; idempotent on re-sync (skips when options already present).

### Validated
  - Migration `20260530120000_question_source_of_truth` applied on dev Neon DB.
  - 5-row fixture imported; 1 question published ("Do you have any siblings?"); 1 `FlowQuestion` upserted (`isActive=true`, linked via `sourceQuestionId`).
  - Runtime: `getNextQuestion` serves projected question with 2 options; `answerQuestion` records response with `yes` optionId; re-sync does not duplicate options.

### Migration
  - `20260530120000_question_source_of_truth` — additive schema only; no data drops.
