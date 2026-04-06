-- AlterTable
ALTER TABLE "users" ADD COLUMN "countryCode" TEXT;

-- CreateEnum
CREATE TYPE "QuestionReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "question_reactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "QuestionReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_reactions_userId_questionId_key" ON "question_reactions"("userId", "questionId");

-- CreateIndex
CREATE INDEX "question_reactions_questionId_type_createdAt_idx" ON "question_reactions"("questionId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "question_reactions_userId_createdAt_idx" ON "question_reactions"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "question_reactions" ADD CONSTRAINT "question_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_reactions" ADD CONSTRAINT "question_reactions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
