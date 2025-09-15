-- CreateTable
CREATE TABLE "flows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_steps" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "section" TEXT,
    "branchCondition" JSONB,
    "randomGroup" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "flow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_step_links" (
    "id" TEXT NOT NULL,
    "fromStepId" TEXT NOT NULL,
    "toStepId" TEXT NOT NULL,
    "condition" JSONB,

    CONSTRAINT "flow_step_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "currentStepId" TEXT,
    "answers" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "flow_progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flow_steps" ADD CONSTRAINT "flow_steps_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_steps" ADD CONSTRAINT "flow_steps_questionVersionId_fkey" FOREIGN KEY ("questionVersionId") REFERENCES "question_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_step_links" ADD CONSTRAINT "flow_step_links_fromStepId_fkey" FOREIGN KEY ("fromStepId") REFERENCES "flow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_step_links" ADD CONSTRAINT "flow_step_links_toStepId_fkey" FOREIGN KEY ("toStepId") REFERENCES "flow_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_progress" ADD CONSTRAINT "flow_progress_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_progress" ADD CONSTRAINT "flow_progress_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "flow_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
