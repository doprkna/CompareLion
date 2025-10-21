-- CreateTable
CREATE TABLE "user_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_insights_userId_generatedAt_idx" ON "user_insights"("userId", "generatedAt");

-- CreateIndex
CREATE INDEX "user_insights_expiresAt_idx" ON "user_insights"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_insights" ADD CONSTRAINT "user_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
