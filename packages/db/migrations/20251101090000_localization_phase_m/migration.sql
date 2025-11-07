-- v0.27.0 - Phase M: Localization fields

-- 1) Enum for language (Prisma will map this accordingly for Postgres)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Lang') THEN
    CREATE TYPE "Lang" AS ENUM ('en', 'cs');
  END IF;
END $$;

-- 2) Users: add lang (default 'en'); add compound index with existing region field
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lang" "Lang" NOT NULL DEFAULT 'en';
CREATE INDEX IF NOT EXISTS "users_lang_region_idx" ON "users" ("lang", "region");

-- 3) Questions: add lang, region, isLocalized, and index
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "lang" "Lang";
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "region" TEXT NOT NULL DEFAULT 'global';
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "isLocalized" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "questions_lang_region_idx" ON "questions" ("lang", "region");


