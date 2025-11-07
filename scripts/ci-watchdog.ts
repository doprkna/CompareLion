#!/usr/bin/env tsx

/**
 * CI Database Watchdog
 * 
 * Lightweight version for CI/CD pipelines
 * Only checks database health without auto-repair
 */

import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

interface CIHealthCheck {
  users: number;
  questions: number;
  achievements: number;
  items: number;
  totalRecords: number;
  isHealthy: boolean;
  timestamp: string;
}

class CIWatchdog {
  private prisma: PrismaClient | null = null;

  async checkHealth(): Promise<CIHealthCheck> {
    try {
      this.prisma = new PrismaClient({ log: ['error'] });

      const [users, questions, achievements, items] = await Promise.all([
        this.prisma.user.count().catch(() => 0),
        this.prisma.question.count().catch(() => 0),
        this.prisma.achievement.count().catch(() => 0),
        this.prisma.item.count().catch(() => 0),
      ]);

      const totalRecords = users + questions + achievements + items;
      const isHealthy = users >= 3 && questions >= 5 && achievements >= 3 && items >= 3;

      return {
        users,
        questions,
        achievements,
        items,
        totalRecords,
        isHealthy,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

    } catch (error) {
      console.error('❌ CI health check failed:', error);
      return {
        users: 0,
        questions: 0,
        achievements: 0,
        items: 0,
        totalRecords: 0,
        isHealthy: false,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
    } finally {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
    }
  }

  async run(): Promise<void> {
    const health = await this.checkHealth();
    
    if (health.isHealthy) {
      console.log(`✅ CI DB Health Check: ${health.totalRecords} records (${health.users} users, ${health.questions} questions, ${health.achievements} achievements, ${health.items} items)`);
      process.exit(0);
    } else {
      console.log(`❌ CI DB Health Check Failed: ${health.totalRecords} records (${health.users} users, ${health.questions} questions, ${health.achievements} achievements, ${health.items} items)`);
      console.log('💡 Run "pnpm watchdog" to auto-repair the database');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const watchdog = new CIWatchdog();
  await watchdog.run();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ CI Watchdog failed:', error);
    process.exit(1);
  });
}

export { CIWatchdog };

























