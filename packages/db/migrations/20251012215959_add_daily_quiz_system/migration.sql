-- CreateTable
CREATE TABLE "daily_quizzes" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionIds" TEXT[],
    "rewardXp" INTEGER NOT NULL DEFAULT 50,
    "rewardHearts" INTEGER NOT NULL DEFAULT 1,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_quiz_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quiz_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_energy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hearts" INTEGER NOT NULL DEFAULT 5,
    "maxHearts" INTEGER NOT NULL DEFAULT 5,
    "lastRegenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_energy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_quizzes_date_key" ON "daily_quizzes"("date");

-- CreateIndex
CREATE INDEX "daily_quizzes_date_idx" ON "daily_quizzes"("date");

-- CreateIndex
CREATE INDEX "daily_quiz_completions_userId_idx" ON "daily_quiz_completions"("userId");

-- CreateIndex
CREATE INDEX "daily_quiz_completions_quizId_idx" ON "daily_quiz_completions"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_quiz_completions_userId_quizId_key" ON "daily_quiz_completions"("userId", "quizId");

-- CreateIndex
CREATE UNIQUE INDEX "user_energy_userId_key" ON "user_energy"("userId");

-- AddForeignKey
ALTER TABLE "daily_quiz_completions" ADD CONSTRAINT "daily_quiz_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_quiz_completions" ADD CONSTRAINT "daily_quiz_completions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "daily_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_energy" ADD CONSTRAINT "user_energy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
