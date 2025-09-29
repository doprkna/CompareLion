-- CreateTable
CREATE TABLE "QuestionText" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dedupeHash" TEXT,

    CONSTRAINT "QuestionText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionText_questionId_lang_key" ON "QuestionText"("questionId", "lang");

-- AddForeignKey
ALTER TABLE "QuestionText" ADD CONSTRAINT "QuestionText_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
