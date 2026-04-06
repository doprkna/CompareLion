ALTER TABLE "public_polls" ADD COLUMN IF NOT EXISTS "packKey" TEXT;
CREATE INDEX IF NOT EXISTS "public_polls_packKey_idx" ON "public_polls"("packKey");
