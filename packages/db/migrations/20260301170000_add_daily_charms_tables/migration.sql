-- CreateTable: Daily Charms (v0.45.21 task system v1)
CREATE TABLE IF NOT EXISTS "daily_charms" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_charms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_daily_charms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "charmId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_daily_charms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "daily_charms_key_key" ON "daily_charms"("key");
CREATE UNIQUE INDEX IF NOT EXISTS "user_daily_charms_userId_charmId_date_key" ON "user_daily_charms"("userId", "charmId", "date");
CREATE INDEX IF NOT EXISTS "user_daily_charms_userId_date_idx" ON "user_daily_charms"("userId", "date");

-- AddForeignKey (only if constraint doesn't exist - we run and may fail; simpler to skip checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_daily_charms_userId_fkey') THEN
    ALTER TABLE "user_daily_charms" ADD CONSTRAINT "user_daily_charms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_daily_charms_charmId_fkey') THEN
    ALTER TABLE "user_daily_charms" ADD CONSTRAINT "user_daily_charms_charmId_fkey" FOREIGN KEY ("charmId") REFERENCES "daily_charms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
