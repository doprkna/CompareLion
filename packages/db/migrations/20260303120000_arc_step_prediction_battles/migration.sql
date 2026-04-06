-- v0.47.16/17 - Prediction Battles + Arc System
-- FlowQuestion: tags, arcStep
-- User: predictionCorrectCount, predictionResolvedCount
-- UserStreak: predictionCorrectStreak, predictionLongestStreak
-- PredictionQuestion, PredictionAnswer

-- FlowQuestion.tags (C19 Distance Rules)
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- FlowQuestion.arcStep (C21 Arc System)
ALTER TABLE "flow_questions" ADD COLUMN IF NOT EXISTS "arcStep" TEXT;

-- User prediction accuracy (C20 Prediction Battles)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "predictionCorrectCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "predictionResolvedCount" INTEGER NOT NULL DEFAULT 0;

-- UserStreak prediction streaks
ALTER TABLE "user_streaks" ADD COLUMN IF NOT EXISTS "predictionCorrectStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_streaks" ADD COLUMN IF NOT EXISTS "predictionLongestStreak" INTEGER NOT NULL DEFAULT 0;

-- PredictionQuestion table
CREATE TABLE "prediction_questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "options" TEXT[] NOT NULL,
    "correctOptionIdx" INTEGER,
    "resolutionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_questions_pkey" PRIMARY KEY ("id")
);

-- PredictionAnswer table
CREATE TABLE "prediction_answers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "selectedOptionIdx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_answers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prediction_answers_userId_predictionId_key" ON "prediction_answers"("userId", "predictionId");
CREATE INDEX "prediction_answers_userId_idx" ON "prediction_answers"("userId");
CREATE INDEX "prediction_answers_predictionId_idx" ON "prediction_answers"("predictionId");
CREATE INDEX "prediction_questions_status_resolutionDate_idx" ON "prediction_questions"("status", "resolutionDate");
CREATE INDEX "prediction_questions_categoryId_status_idx" ON "prediction_questions"("categoryId", "status");

ALTER TABLE "prediction_answers" ADD CONSTRAINT "prediction_answers_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "prediction_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prediction_answers" ADD CONSTRAINT "prediction_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
