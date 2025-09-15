-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "subSubCategoryId" TEXT,
    "relatedToId" TEXT,
    "currentVersionId" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_versions" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "displayText" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "question_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_version_tags" (
    "id" TEXT NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "question_version_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_currentVersionId_key" ON "questions"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "question_versions_questionId_version_key" ON "question_versions"("questionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "question_tags_name_key" ON "question_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "question_version_tags_questionVersionId_tagId_key" ON "question_version_tags"("questionVersionId", "tagId");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "question_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_relatedToId_fkey" FOREIGN KEY ("relatedToId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_version_tags" ADD CONSTRAINT "question_version_tags_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "question_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_version_tags" ADD CONSTRAINT "question_version_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "question_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
