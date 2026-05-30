-- FlowQuestion report ledger for QuestionStats.reportCount



CREATE TABLE IF NOT EXISTS "question_reports" (

    "id" TEXT NOT NULL,

    "userId" TEXT,

    "questionId" TEXT NOT NULL,

    "sourceQuestionId" TEXT,

    "reason" TEXT,

    "details" TEXT,

    "status" TEXT NOT NULL DEFAULT 'OPEN',

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_reports_pkey" PRIMARY KEY ("id")

);



CREATE INDEX IF NOT EXISTS "question_reports_questionId_idx"

  ON "question_reports"("questionId");

CREATE INDEX IF NOT EXISTS "question_reports_sourceQuestionId_idx"

  ON "question_reports"("sourceQuestionId");

CREATE INDEX IF NOT EXISTS "question_reports_status_idx"

  ON "question_reports"("status");

CREATE INDEX IF NOT EXISTS "question_reports_createdAt_idx"

  ON "question_reports"("createdAt");



DO $$ BEGIN

  ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_questionId_fkey"

    FOREIGN KEY ("questionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

EXCEPTION

  WHEN duplicate_object THEN null;

END $$;



DO $$ BEGIN

  ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_sourceQuestionId_fkey"

    FOREIGN KEY ("sourceQuestionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

EXCEPTION

  WHEN duplicate_object THEN null;

END $$;

