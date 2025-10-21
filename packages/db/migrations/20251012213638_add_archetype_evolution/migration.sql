-- CreateTable
CREATE TABLE "user_archetype_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousType" TEXT,
    "newType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "statSnapshot" JSONB,
    "xpBonus" INTEGER NOT NULL DEFAULT 50,
    "evolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_archetype_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_archetype_history_userId_evolvedAt_idx" ON "user_archetype_history"("userId", "evolvedAt");

-- AddForeignKey
ALTER TABLE "user_archetype_history" ADD CONSTRAINT "user_archetype_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
