/**
 * Self-Healing Routines (v0.11.3)
 * 
 * Automated recovery from common failure scenarios.
 */

import { prisma } from "@/lib/db/connection-pool";
import { createLogger } from "./correlation-id";
import { captureMessage, ErrorSeverity } from "./error-tracker";
import { createQueue, QUEUE_PRIORITIES } from "@/lib/queue/queue-config";

const logger = createLogger("SelfHealing");

/**
 * Heal stale sessions
 * 
 * Removes sessions older than configured TTL
 */
export async function healStaleSessions(): Promise<number> {
  logger.info("Starting stale session cleanup...");
  
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    
    const deleted = result.count;
    
    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} stale sessions`);
      captureMessage(
        `Cleaned up ${deleted} stale sessions`,
        { action: "heal_stale_sessions" },
        ErrorSeverity.INFO
      );
    }
    
    return deleted;
  } catch (error) {
    logger.error("Failed to clean stale sessions:", error as Error);
    throw error;
  }
}

/**
 * Heal stuck jobs
 * 
 * Resets jobs that have been active for too long
 */
export async function healStuckJobs(): Promise<number> {
  logger.info("Starting stuck job recovery...");
  
  let totalHealed = 0;
  
  try {
    // Check each queue
    const priorities = [
      QUEUE_PRIORITIES.HIGH,
      QUEUE_PRIORITIES.MEDIUM,
      QUEUE_PRIORITIES.LOW,
    ];
    
    for (const priority of priorities) {
      const queue = createQueue(priority);
      
      try {
        // Get stuck jobs (active for > 5 minutes)
        const stuckJobs = await queue.getJobs(["active"], 0, 1000);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        for (const job of stuckJobs) {
          const activeTime = now - (job.processedOn || now);
          
          if (activeTime > fiveMinutes) {
            // Move to failed and allow retry
            await job.moveToFailed(
              new Error("Job stuck - auto-failed by self-healing"),
              "0"
            );
            totalHealed++;
            
            logger.warn(`Moved stuck job to failed: ${job.id}`, {
              jobId: job.id,
              jobName: job.name,
              activeTime: `${Math.floor(activeTime / 1000)}s`,
            });
          }
        }
      } finally {
        await queue.close();
      }
    }
    
    if (totalHealed > 0) {
      captureMessage(
        `Healed ${totalHealed} stuck jobs`,
        { action: "heal_stuck_jobs" },
        ErrorSeverity.WARNING
      );
    }
    
    return totalHealed;
  } catch (error) {
    logger.error("Failed to heal stuck jobs:", error as Error);
    throw error;
  }
}

/**
 * Clean up orphaned records
 * 
 * Removes database records that reference deleted entities
 */
export async function cleanOrphanedRecords(): Promise<number> {
  logger.info("Starting orphaned records cleanup...");
  
  let totalCleaned = 0;
  
  try {
    // Clean orphaned notifications (user deleted)
    const orphanedNotifications = await prisma.notification.deleteMany({
      where: {
        user: null as any, // User was deleted
      },
    });
    totalCleaned += orphanedNotifications.count;
    
    // Clean orphaned inventory items (user deleted)
    const orphanedInventory = await prisma.inventoryItem.deleteMany({
      where: {
        user: null as any,
      },
    });
    totalCleaned += orphanedInventory.count;
    
    if (totalCleaned > 0) {
      logger.info(`Cleaned ${totalCleaned} orphaned records`);
      captureMessage(
        `Cleaned ${totalCleaned} orphaned records`,
        { action: "clean_orphaned_records" },
        ErrorSeverity.INFO
      );
    }
    
    return totalCleaned;
  } catch (error) {
    logger.error("Failed to clean orphaned records:", error as Error);
    throw error;
  }
}

/**
 * Vacuum database (optimize)
 * 
 * Reclaims storage and updates statistics
 */
export async function vacuumDatabase(): Promise<void> {
  logger.info("Starting database vacuum...");
  
  try {
    // Note: VACUUM cannot run inside a transaction
    // This is a placeholder - actual vacuum should be run via pg_cron or external script
    logger.info("Database vacuum completed (placeholder)");
    
    // In production, use:
    // await prisma.$executeRawUnsafe('VACUUM ANALYZE');
  } catch (error) {
    logger.error("Failed to vacuum database:", error as Error);
    throw error;
  }
}

/**
 * Run all healing routines
 */
export async function runAllHealingRoutines(): Promise<{
  staleSessions: number;
  stuckJobs: number;
  orphanedRecords: number;
  duration: number;
}> {
  const startTime = Date.now();
  
  logger.info("=== Starting self-healing routines ===");
  
  const results = {
    staleSessions: 0,
    stuckJobs: 0,
    orphanedRecords: 0,
    duration: 0,
  };
  
  try {
    results.staleSessions = await healStaleSessions();
    results.stuckJobs = await healStuckJobs();
    results.orphanedRecords = await cleanOrphanedRecords();
    
    results.duration = Date.now() - startTime;
    
    logger.info(`=== Self-healing completed in ${results.duration}ms ===`, results);
    
    return results;
  } catch (error) {
    logger.error("Self-healing failed:", error as Error);
    throw error;
  }
}

/**
 * Schedule healing routines (cron job)
 */
export function scheduleHealingRoutines() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  
  logger.info("Scheduling self-healing routines (every 6 hours)");
  
  // Run immediately
  runAllHealingRoutines().catch((error) => {
    logger.error("Initial healing failed:", error);
  });
  
  // Schedule recurring
  setInterval(() => {
    runAllHealingRoutines().catch((error) => {
      logger.error("Scheduled healing failed:", error);
    });
  }, SIX_HOURS);
}











