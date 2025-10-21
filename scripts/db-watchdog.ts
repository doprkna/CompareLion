#!/usr/bin/env tsx

/**
 * Database Watchdog - Auto-healing database monitor
 * 
 * Monitors database health and automatically repairs when needed:
 * - Checks if database has sufficient data
 * - Auto-pushes schema if needed
 * - Auto-seeds data if database is empty
 * - Logs all activities
 * - Updates changelog with reseed timestamps
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import { WebhookNotifier } from './webhook-notify';
import { config } from 'dotenv';

// Load environment variables
config();

const execAsync = promisify(exec);

interface DatabaseHealth {
  users: number;
  questions: number;
  achievements: number;
  items: number;
  totalRecords: number;
  isHealthy: boolean;
  issues: string[];
}

interface WatchdogConfig {
  minUsers: number;
  minQuestions: number;
  minAchievements: number;
  minItems: number;
  logFile: string;
  changelogFile: string;
  isProduction: boolean;
}

class DatabaseWatchdog {
  private prisma: PrismaClient | null = null;
  private config: WatchdogConfig;
  private webhookNotifier: WebhookNotifier;

  constructor() {
    this.config = {
      minUsers: 3,
      minQuestions: 5,
      minAchievements: 3,
      minItems: 3,
      logFile: join(process.cwd(), 'logs', 'db-watchdog.log'),
      changelogFile: join(process.cwd(), 'apps', 'web', 'CHANGELOG.md'),
      isProduction: process.env.NODE_ENV === 'production',
    };

    this.webhookNotifier = new WebhookNotifier();

    // Ensure logs directory exists
    const logsDir = join(process.cwd(), 'logs');
    if (!existsSync(logsDir)) {
      try {
        mkdirSync(logsDir, { recursive: true });
        this.log(`📁 Created logs directory: ${logsDir}`);
      } catch (error) {
        this.log(`⚠️ Failed to create logs directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async initialize(): Promise<void> {
    try {
      // Only run in non-production environments
      if (this.config.isProduction) {
        this.log('Skipping watchdog in production environment');
        return;
      }

      // Check if .env exists
      if (!existsSync(join(process.cwd(), '.env'))) {
        this.log('❌ .env file not found - skipping watchdog');
        return;
      }

      // Initialize Prisma client
      this.prisma = new PrismaClient({
        log: ['error'],
      });

      this.log('🔍 Database Watchdog initialized');
      await this.checkDatabaseHealth();
    } catch (error) {
      this.log(`❌ Watchdog initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    } finally {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    try {
      if (!this.prisma) {
        throw new Error('Prisma client not initialized');
      }

      this.log('🔍 Checking database health...');

      // Run health checks in parallel
      const [users, questions, achievements, items] = await Promise.all([
        this.prisma.user.count().catch(() => 0),
        this.prisma.question.count().catch(() => 0),
        this.prisma.achievement.count().catch(() => 0),
        this.prisma.item.count().catch(() => 0),
      ]);

      const health: DatabaseHealth = {
        users,
        questions,
        achievements,
        items,
        totalRecords: users + questions + achievements + items,
        isHealthy: true,
        issues: [],
      };

      // Check for issues
      if (users < this.config.minUsers) {
        health.issues.push(`Users: ${users} (min: ${this.config.minUsers})`);
        health.isHealthy = false;
      }

      if (questions < this.config.minQuestions) {
        health.issues.push(`Questions: ${questions} (min: ${this.config.minQuestions})`);
        health.isHealthy = false;
      }

      if (achievements < this.config.minAchievements) {
        health.issues.push(`Achievements: ${achievements} (min: ${this.config.minAchievements})`);
        health.isHealthy = false;
      }

      if (items < this.config.minItems) {
        health.issues.push(`Items: ${items} (min: ${this.config.minItems})`);
        health.isHealthy = false;
      }

      if (health.isHealthy) {
        this.log(`✅ DB verified. ${health.totalRecords} records. Version v0.12.6`);
        this.writeLog(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] DB verified. ${health.totalRecords} records. Version v0.12.6`);
      } else {
        this.log(`🚨 DB health issues detected: ${health.issues.join(', ')}`);
        await this.triggerReseed();
      }

    } catch (error) {
      this.log(`❌ Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // If it's a connection error, try to repair
      if (error instanceof Error && error.message.includes('connect')) {
        this.log('🔧 Connection error detected - attempting repair...');
        await this.triggerReseed();
      }
    }
  }

  private async triggerReseed(): Promise<void> {
    try {
      this.log('🚨 DB empty or unhealthy — auto-repair triggered');
      this.writeLog(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Auto-repair triggered`);

      // Step 1: Push schema
      this.log('📋 Pushing database schema...');
      const { stdout: pushOutput, stderr: pushError } = await execAsync('pnpm db:push', {
        cwd: process.cwd(),
      });

      if (pushError && !pushError.includes('warnings')) {
        this.log(`⚠️ Schema push warnings: ${pushError}`);
      } else {
        this.log('✅ Schema pushed successfully');
      }

      // Step 2: Seed database
      this.log('🌱 Seeding database...');
      const { stdout: seedOutput, stderr: seedError } = await execAsync('pnpm db:seed', {
        cwd: process.cwd(),
      });

      if (seedError && !seedError.includes('warnings')) {
        this.log(`⚠️ Seed warnings: ${seedError}`);
      } else {
        this.log('✅ Database seeded successfully');
      }

      // Step 3: Verify repair
      this.log('🔍 Verifying repair...');
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.prisma = new PrismaClient({ log: ['error'] });
      }

      const [users, questions, achievements, items] = await Promise.all([
        this.prisma.user.count().catch(() => 0),
        this.prisma.question.count().catch(() => 0),
        this.prisma.achievement.count().catch(() => 0),
        this.prisma.item.count().catch(() => 0),
      ]);

      const totalRecords = users + questions + achievements + items;
      const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

      this.log(`✅ Auto-repair completed. ${totalRecords} records. Version v0.12.6`);
      this.writeLog(`[${timestamp}] Auto-repair completed. ${totalRecords} records. Version v0.12.6`);

      // Step 4: Update changelog
      await this.updateChangelog(timestamp, totalRecords);

      // Step 5: Send webhook notification
      await this.webhookNotifier.notifyReseed(totalRecords, timestamp);

    } catch (error) {
      this.log(`❌ Auto-repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.writeLog(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Auto-repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async updateChangelog(timestamp: string, recordCount: number): Promise<void> {
    try {
      if (!existsSync(this.config.changelogFile)) {
        this.log('⚠️ Changelog file not found - skipping update');
        return;
      }

      const changelogEntry = `\n✅ Auto-reseed ${timestamp} (${recordCount} records)\n`;
      
      // Read current changelog
      const currentContent = readFileSync(this.config.changelogFile, 'utf-8');
      
      // Find the first version entry and insert our entry before it
      const versionMatch = currentContent.match(/^## \[/m);
      if (versionMatch) {
        const insertIndex = versionMatch.index!;
        const newContent = 
          currentContent.slice(0, insertIndex) + 
          changelogEntry + 
          currentContent.slice(insertIndex);
        
        writeFileSync(this.config.changelogFile, newContent);
        this.log('📝 Changelog updated with reseed timestamp');
      } else {
        // Fallback: append to end
        appendFileSync(this.config.changelogFile, changelogEntry);
        this.log('📝 Changelog updated (appended)');
      }

    } catch (error) {
      this.log(`⚠️ Failed to update changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private log(message: string): void {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    console.log(`[${timestamp}] ${message}`);
  }

  private writeLog(message: string): void {
    try {
      // Ensure logs directory exists before writing
      const logsDir = join(process.cwd(), 'logs');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }
      appendFileSync(this.config.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private validateChangelogTimestamps(): void {
    try {
      if (!existsSync(this.config.changelogFile)) {
        return;
      }

      const content = readFileSync(this.config.changelogFile, 'utf-8');
      const now = dayjs();
      
      // Look for suspicious future dates in changelog
      const dateMatches = content.match(/\d{4}-\d{2}-\d{2}/g);
      if (dateMatches) {
        for (const dateStr of dateMatches) {
          const date = dayjs(dateStr);
          if (date.isAfter(now)) {
            this.log(`⚠️ Future date detected in changelog: ${dateStr} (time-travel detected!)`);
          }
        }
      }
    } catch (error) {
      this.log(`⚠️ Changelog validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Main execution
async function main() {
  const watchdog = new DatabaseWatchdog();
  
  // Validate changelog timestamps first
  watchdog['validateChangelogTimestamps']();
  
  // Run the watchdog
  await watchdog.initialize();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Watchdog failed:', error);
    process.exit(1);
  });
}

export { DatabaseWatchdog };
