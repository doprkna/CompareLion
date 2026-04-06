-- AlterTable
ALTER TABLE "flow_questions" ADD COLUMN "challengeEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "question_challenges" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT,
    "status" TEXT NOT NULL,
    "challengerAnswerId" TEXT,
    "challengedAnswerId" TEXT,
    "xpGranted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "question_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_challenges_questionId_idx" ON "question_challenges"("questionId");

-- CreateIndex
CREATE INDEX "question_challenges_challengerId_idx" ON "question_challenges"("challengerId");

-- CreateIndex
CREATE INDEX "question_challenges_challengedId_idx" ON "question_challenges"("challengedId");

-- AddForeignKey
ALTER TABLE "question_challenges" ADD CONSTRAINT "question_challenges_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_challenges" ADD CONSTRAINT "question_challenges_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_challenges" ADD CONSTRAINT "question_challenges_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
