/**
 * Cron Job Configuration (v0.29.21)
 * 
 * Central registry of all cron jobs with their schedules and handlers.
 */

import { registerCronJob, type CronJobConfig } from './cron';

// Import job handlers
import { runWeeklyReflections } from './jobs/weeklyReflections';
import { runSeasonSwitch } from './jobs/seasonSwitch';
import { runEventsCleanup } from './jobs/eventsCleanup';
import { runLootReset } from './jobs/lootReset';
import { runMarketRefresh } from './jobs/marketRefresh';
import { runWeeklyChronicles } from './jobs/weeklyChronicles';

/**
 * Register all cron jobs
 */
export function registerAllCronJobs(): void {
  const jobs: CronJobConfig[] = [
    {
      key: 'weeklyReflections',
      schedule: '@weekly',
      handler: runWeeklyReflections,
      description: 'Generate weekly reflections for active users',
    },
    {
      key: 'seasonSwitch',
      schedule: '0 0 1 * *', // First day of month at midnight
      handler: runSeasonSwitch,
      description: 'Handle season rollover and grants',
    },
    {
      key: 'eventsCleanup',
      schedule: '@daily',
      handler: runEventsCleanup,
      description: 'Clear expired events and shares',
    },
    {
      key: 'lootReset',
      schedule: '@daily',
      handler: runLootReset,
      description: 'Reset daily loot cooldowns',
    },
    {
      key: 'marketRefresh',
      schedule: '@weekly',
      handler: runMarketRefresh,
      description: 'Rotate event shop items weekly',
    },
    {
      key: 'weeklyChronicles',
      schedule: '@weekly',
      handler: runWeeklyChronicles,
      description: 'Auto-generate weekly user chronicles',
    },
  ];

  // Register each job
  jobs.forEach(job => registerCronJob(job));
}

/**
 * Get all job configurations
 */
export function getCronJobsConfig(): CronJobConfig[] {
  // Return configuration for display/debugging
  return [
    { key: 'weeklyReflections', schedule: '@weekly', handler: runWeeklyReflections },
    { key: 'seasonSwitch', schedule: '0 0 1 * *', handler: runSeasonSwitch },
    { key: 'eventsCleanup', schedule: '@daily', handler: runEventsCleanup },
    { key: 'lootReset', schedule: '@daily', handler: runLootReset },
    { key: 'marketRefresh', schedule: '@weekly', handler: runMarketRefresh },
    { key: 'weeklyChronicles', schedule: '@weekly', handler: runWeeklyChronicles },
  ];
}

