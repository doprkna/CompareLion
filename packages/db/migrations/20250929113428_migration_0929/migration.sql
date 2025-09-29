/*
  Warnings:

  - You are about to drop the `QuestionText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionText" DROP CONSTRAINT "QuestionText_questionId_fkey";

-- DropTable
DROP TABLE "QuestionText";
