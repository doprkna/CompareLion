-- CreateTable
CREATE TABLE "global_feed_items" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "metadata" JSONB,
    "reactionsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "global_feed_items_createdAt_idx" ON "global_feed_items"("createdAt");

-- CreateIndex
CREATE INDEX "global_feed_items_reactionsCount_createdAt_idx" ON "global_feed_items"("reactionsCount", "createdAt");

-- CreateIndex
CREATE INDEX "global_feed_items_userId_idx" ON "global_feed_items"("userId");

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "global_feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_feed_items" ADD CONSTRAINT "global_feed_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
