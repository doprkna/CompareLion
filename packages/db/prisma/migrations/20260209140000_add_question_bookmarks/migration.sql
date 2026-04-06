-- CreateTable
CREATE TABLE "question_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_unlocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "premium_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_bookmarks_userId_questionId_key" ON "question_bookmarks"("userId", "questionId");

-- CreateIndex
CREATE INDEX "question_bookmarks_userId_createdAt_idx" ON "question_bookmarks"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "question_bookmarks_questionId_createdAt_idx" ON "question_bookmarks"("questionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "premium_unlocks_userId_kind_refId_key" ON "premium_unlocks"("userId", "kind", "refId");

-- CreateIndex
CREATE INDEX "premium_unlocks_userId_idx" ON "premium_unlocks"("userId");

-- AddForeignKey
ALTER TABLE "question_bookmarks" ADD CONSTRAINT "question_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bookmarks" ADD CONSTRAINT "question_bookmarks_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "premium_unlocks" ADD CONSTRAINT "premium_unlocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
