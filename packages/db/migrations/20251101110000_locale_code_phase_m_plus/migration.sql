-- v0.27.1 - Locale code additions and indexes

-- User: add localeCode with default
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "localeCode" TEXT NOT NULL DEFAULT 'en-US';
CREATE INDEX IF NOT EXISTS "users_localeCode_idx" ON "users" ("localeCode");

-- Question: add localeCode and index
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "localeCode" TEXT NOT NULL DEFAULT 'global';
CREATE INDEX IF NOT EXISTS "questions_localeCode_idx" ON "questions" ("localeCode");

-- Events: add localeCode and index
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "localeCode" TEXT NOT NULL DEFAULT 'global';
CREATE INDEX IF NOT EXISTS "events_localeCode_idx" ON "events" ("localeCode");

-- Reflection entries: add localeCode and index
ALTER TABLE "reflection_entries" ADD COLUMN IF NOT EXISTS "localeCode" TEXT NOT NULL DEFAULT 'global';
CREATE INDEX IF NOT EXISTS "reflection_entries_localeCode_idx" ON "reflection_entries" ("localeCode");


