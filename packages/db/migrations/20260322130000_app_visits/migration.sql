-- v0.48.02 — App visit counter (admin)
CREATE TABLE "app_visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "app_visits_createdAt_idx" ON "app_visits"("createdAt");
CREATE INDEX "app_visits_userId_createdAt_idx" ON "app_visits"("userId", "createdAt");

ALTER TABLE "app_visits" ADD CONSTRAINT "app_visits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
