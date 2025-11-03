-- Manual Migration v0.33.5a
-- Creates missing tables: BalanceSetting, EconomyPreset, SystemAlert, CronJobLog, AlertWebhook

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE "CronJobStatus" AS ENUM ('success', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SystemAlertType" AS ENUM ('cron', 'api', 'db', 'cache', 'memory', 'cpu');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SystemAlertLevel" AS ENUM ('info', 'warn', 'error', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "WebhookType" AS ENUM ('discord', 'slack', 'generic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- BalanceSetting
CREATE TABLE IF NOT EXISTS "balance_settings" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" DOUBLE PRECISION NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "balance_settings_key_idx" ON "balance_settings"("key");

-- EconomyPreset
CREATE TABLE IF NOT EXISTS "economy_presets" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "modifiers" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "economy_presets_name_idx" ON "economy_presets"("name");

-- SystemAlert
CREATE TABLE IF NOT EXISTS "system_alerts" (
  "id" TEXT PRIMARY KEY,
  "type" "SystemAlertType" NOT NULL,
  "level" "SystemAlertLevel" NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "autoResolved" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS "system_alerts_createdAt_idx" ON "system_alerts"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "system_alerts_level_idx" ON "system_alerts"("level");
CREATE INDEX IF NOT EXISTS "system_alerts_type_idx" ON "system_alerts"("type");
CREATE INDEX IF NOT EXISTS "system_alerts_resolvedAt_idx" ON "system_alerts"("resolvedAt");

-- CronJobLog
CREATE TABLE IF NOT EXISTS "cron_job_logs" (
  "id" TEXT PRIMARY KEY,
  "jobKey" TEXT NOT NULL,
  "status" "CronJobStatus" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "durationMs" INTEGER,
  "errorMessage" TEXT
);

CREATE INDEX IF NOT EXISTS "cron_job_logs_jobKey_startedAt_idx" ON "cron_job_logs"("jobKey", "startedAt" DESC);

-- AlertWebhook
CREATE TABLE IF NOT EXISTS "alert_webhooks" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "type" "WebhookType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "alert_webhooks_isActive_idx" ON "alert_webhooks"("isActive");