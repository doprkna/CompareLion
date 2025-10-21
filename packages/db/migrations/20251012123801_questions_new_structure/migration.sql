-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTI_CHOICE', 'NUMBER', 'TEXT');

-- CreateTable
CREATE TABLE "flow_questions" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flow_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "flow_question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT,
    "valueText" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "timeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flow_questions_categoryId_isActive_idx" ON "flow_questions"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "flow_questions_locale_isActive_idx" ON "flow_questions"("locale", "isActive");

-- CreateIndex
CREATE INDEX "flow_question_options_questionId_idx" ON "flow_question_options"("questionId");

-- CreateIndex
CREATE INDEX "user_responses_userId_idx" ON "user_responses"("userId");

-- CreateIndex
CREATE INDEX "user_responses_questionId_idx" ON "user_responses"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_responses_userId_questionId_key" ON "user_responses"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "flow_questions" ADD CONSTRAINT "flow_questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SssCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_question_options" ADD CONSTRAINT "flow_question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_responses" ADD CONSTRAINT "user_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
