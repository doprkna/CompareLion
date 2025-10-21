-- CreateTable
CREATE TABLE "user_timezones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "utcOffset" INTEGER NOT NULL,
    "detectedFrom" TEXT,
    "localMidnight" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_timezones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_schedules" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "dailyResetOffset" INTEGER NOT NULL DEFAULT 0,
    "quizResetOffset" INTEGER NOT NULL DEFAULT 0,
    "energyResetOffset" INTEGER NOT NULL DEFAULT 0,
    "nextDailyReset" TIMESTAMP(3),
    "nextQuizReset" TIMESTAMP(3),
    "nextEnergyReset" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "region_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_timezones_userId_key" ON "user_timezones"("userId");

-- CreateIndex
CREATE INDEX "user_timezones_userId_idx" ON "user_timezones"("userId");

-- CreateIndex
CREATE INDEX "user_timezones_timezone_idx" ON "user_timezones"("timezone");

-- CreateIndex
CREATE UNIQUE INDEX "region_schedules_region_key" ON "region_schedules"("region");

-- AddForeignKey
ALTER TABLE "user_timezones" ADD CONSTRAINT "user_timezones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
