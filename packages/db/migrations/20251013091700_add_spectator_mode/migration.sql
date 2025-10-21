-- CreateTable
CREATE TABLE "duel_spectators" (
    "id" TEXT NOT NULL,
    "duelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reactedAt" TIMESTAMP(3),

    CONSTRAINT "duel_spectators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duel_highlights" (
    "id" TEXT NOT NULL,
    "duelId" TEXT NOT NULL,
    "initiatorName" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "scoreDiff" INTEGER NOT NULL,
    "finalScore" TEXT NOT NULL,
    "category" TEXT,
    "isTopOfDay" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duel_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duel_spectators_duelId_idx" ON "duel_spectators"("duelId");

-- CreateIndex
CREATE UNIQUE INDEX "duel_spectators_duelId_userId_key" ON "duel_spectators"("duelId", "userId");

-- CreateIndex
CREATE INDEX "duel_highlights_isTopOfDay_createdAt_idx" ON "duel_highlights"("isTopOfDay", "createdAt");

-- CreateIndex
CREATE INDEX "duel_highlights_createdAt_idx" ON "duel_highlights"("createdAt");

-- AddForeignKey
ALTER TABLE "duel_spectators" ADD CONSTRAINT "duel_spectators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
