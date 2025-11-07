// v0.33.5 - Schema Audit Script
// Verifies database tables match expected schema

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('ðŸ” Auditing Database Schema...\n');

  try {
    // Query all tables in the database
    const tables: any[] = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log(`ðŸ“Š Found ${tables.length} tables in database:\n`);

    tables.forEach((row: any) => {
      console.log(`  âœ“ ${row.table_name}`);
    });

    // Check for specific required models
    const requiredTables = [
      'balance_settings',
      'economy_presets',
      'system_alerts',
      'cron_job_logs',
      'alert_webhooks',
      'public_comparisons',
    ];

    console.log(`\nðŸŽ¯ Verifying Required Tables (v0.33.5):\n`);

    const tableNames = tables.map((t: any) => t.table_name);
    let missingCount = 0;

    requiredTables.forEach((tableName) => {
      if (tableNames.includes(tableName)) {
        console.log(`  âœ… ${tableName}`);
      } else {
        console.log(`  âŒ ${tableName} (MISSING)`);
        missingCount++;
      }
    });

    if (missingCount > 0) {
      console.log(`\nâš ï¸  ${missingCount} required tables are missing!`);
      process.exit(1);
    } else {
      console.log(`\nâœ… All required tables exist!`);
    }

    // Quick model count check
    const counts = await Promise.all([
      db.balanceSetting.count(),
      db.economyPreset.count(),
      db.systemAlert.count(),
      db.cronJobLog.count(),
      db.alertWebhook.count(),
    ]);

    console.log(`\nðŸ“ˆ Record Counts:`);
    console.log(`  - BalanceSetting: ${counts[0]}`);
    console.log(`  - EconomyPreset: ${counts[1]}`);
    console.log(`  - SystemAlert: ${counts[2]}`);
    console.log(`  - CronJobLog: ${counts[3]}`);
    console.log(`  - AlertWebhook: ${counts[4]}`);

    console.log(`\nâœ… Schema audit complete!`);
  } catch (error) {
    console.error('âŒ Audit failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => db.$disconnect())
  .catch((err) => {
    console.error(err);
    db.$disconnect();
    process.exit(1);
  });
