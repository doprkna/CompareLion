-- v0.48.01 — Flow reward log (post-flow balancing)
CREATE TABLE "flow_reward_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flow_reward_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "flow_reward_logs_userId_createdAt_idx" ON "flow_reward_logs"("userId", "createdAt");

ALTER TABLE "flow_reward_logs" ADD CONSTRAINT "flow_reward_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
