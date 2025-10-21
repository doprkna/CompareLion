-- CreateTable
CREATE TABLE "coop_missions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questionIds" TEXT[],
    "minMembers" INTEGER NOT NULL DEFAULT 2,
    "maxMembers" INTEGER NOT NULL DEFAULT 3,
    "rewardXp" INTEGER NOT NULL DEFAULT 150,
    "rewardGold" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 24,
    "requiresSync" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdBy" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coop_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coop_members" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReady" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "coop_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coop_progress" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "coop_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coop_missions_status_createdAt_idx" ON "coop_missions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "coop_members_missionId_idx" ON "coop_members"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "coop_members_missionId_userId_key" ON "coop_members"("missionId", "userId");

-- CreateIndex
CREATE INDEX "coop_progress_missionId_confirmed_idx" ON "coop_progress"("missionId", "confirmed");

-- CreateIndex
CREATE UNIQUE INDEX "coop_progress_missionId_questionId_userId_key" ON "coop_progress"("missionId", "questionId", "userId");

-- AddForeignKey
ALTER TABLE "coop_members" ADD CONSTRAINT "coop_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coop_members" ADD CONSTRAINT "coop_members_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "coop_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coop_progress" ADD CONSTRAINT "coop_progress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "coop_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
