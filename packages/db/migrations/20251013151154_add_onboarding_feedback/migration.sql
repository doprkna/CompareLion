-- CreateTable
CREATE TABLE "onboarding_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sawWelcomeOverlay" BOOLEAN NOT NULL DEFAULT false,
    "sawDashboard" BOOLEAN NOT NULL DEFAULT false,
    "completedAnswer" BOOLEAN NOT NULL DEFAULT false,
    "completedCompare" BOOLEAN NOT NULL DEFAULT false,
    "completedChallenge" BOOLEAN NOT NULL DEFAULT false,
    "completedTutorial" BOOLEAN NOT NULL DEFAULT false,
    "tutorialStarted" BOOLEAN NOT NULL DEFAULT false,
    "tutorialStep" INTEGER NOT NULL DEFAULT 0,
    "tutorialCompleted" BOOLEAN NOT NULL DEFAULT false,
    "tutorialReward" BOOLEAN NOT NULL DEFAULT false,
    "tooltipsSeen" TEXT[],
    "showTooltips" BOOLEAN NOT NULL DEFAULT true,
    "skipOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastStepAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "page" TEXT,
    "userAgent" TEXT,
    "screenshot" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tooltip_definitions" (
    "id" TEXT NOT NULL,
    "tooltipId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "page" TEXT NOT NULL,
    "elementId" TEXT,
    "position" TEXT NOT NULL DEFAULT 'bottom',
    "showOnce" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "delayMs" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER NOT NULL DEFAULT 0,
    "maxLevel" INTEGER NOT NULL DEFAULT 999,
    "requiresFlag" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tooltip_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_userId_key" ON "onboarding_progress"("userId");

-- CreateIndex
CREATE INDEX "feedback_submissions_userId_submittedAt_idx" ON "feedback_submissions"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "feedback_submissions_type_status_idx" ON "feedback_submissions"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tooltip_definitions_tooltipId_key" ON "tooltip_definitions"("tooltipId");

-- CreateIndex
CREATE INDEX "tooltip_definitions_page_isActive_idx" ON "tooltip_definitions"("page", "isActive");

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
