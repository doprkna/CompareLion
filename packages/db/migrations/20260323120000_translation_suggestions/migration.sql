-- v0.48.06 — Community translation suggestions (MVP)
CREATE TABLE "translation_suggestions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "translation_suggestions_status_createdAt_idx" ON "translation_suggestions"("status", "createdAt");
CREATE INDEX "translation_suggestions_entityType_entityId_idx" ON "translation_suggestions"("entityType", "entityId");

ALTER TABLE "translation_suggestions" ADD CONSTRAINT "translation_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
