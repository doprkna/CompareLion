-- v0.26.15 - Phase K: Public Comparisons Feed
-- Creates table public_comparisons with reaction counters and indexes

CREATE TABLE IF NOT EXISTS "public_comparisons" (
    "id" TEXT PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT TRUE,
    "reactionsLike" INTEGER NOT NULL DEFAULT 0,
    "reactionsLaugh" INTEGER NOT NULL DEFAULT 0,
    "reactionsThink" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Composite index to support feed queries (isPublic filter + recency)
CREATE INDEX IF NOT EXISTS "public_comparisons_isPublic_createdAt_idx"
ON "public_comparisons" ("isPublic", "createdAt" DESC);

-- Trigger to update updatedAt on row modification (Postgres) - v0.33.5 fixed nested delimiter syntax
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW."updatedAt" = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS public_comparisons_set_updated_at ON "public_comparisons";
CREATE TRIGGER public_comparisons_set_updated_at
BEFORE UPDATE ON "public_comparisons"
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();