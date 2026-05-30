-- FlowQuestion serve/impression ledger for QuestionStats.usageCount

CREATE TABLE IF NOT EXISTS "flow_question_serve_events" (
    "id" TEXT NOT NULL,
    "flowQuestionId" TEXT NOT NULL,
    "sourceQuestionId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "context" TEXT DEFAULT 'flow',
    "metadata" JSONB,
    "servedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flow_question_serve_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "flow_question_serve_events_flowQuestionId_idx"
  ON "flow_question_serve_events"("flowQuestionId");
CREATE INDEX IF NOT EXISTS "flow_question_serve_events_sourceQuestionId_idx"
  ON "flow_question_serve_events"("sourceQuestionId");
CREATE INDEX IF NOT EXISTS "flow_question_serve_events_userId_idx"
  ON "flow_question_serve_events"("userId");
CREATE INDEX IF NOT EXISTS "flow_question_serve_events_servedAt_idx"
  ON "flow_question_serve_events"("servedAt");

DO $$ BEGIN
  ALTER TABLE "flow_question_serve_events" ADD CONSTRAINT "flow_question_serve_events_flowQuestionId_fkey"
    FOREIGN KEY ("flowQuestionId") REFERENCES "flow_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "flow_question_serve_events" ADD CONSTRAINT "flow_question_serve_events_sourceQuestionId_fkey"
    FOREIGN KEY ("sourceQuestionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
