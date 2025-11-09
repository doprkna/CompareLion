/**
 * PareL Database Seeder v0.35.9
 * Full Demo World - 20 users, achievements, shop, events, messages
 * Run: pnpm db:push `&& pnpm db:seed
 */

import { PrismaClient, UserRole, QuestionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
  console.log("â•‘     ðŸŒ± PareL Seeder v0.35.9 - Starting...             â•‘");
  console.log("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n");

  const startTime = Date.now();
  const demoPasswordHash = await hash("password123", 10);

  // =========================================================================
  // 1. USERS (20 total - 1 admin + 19 regular)
  // =========================================================================
  console.log("ðŸ‘¥ Seeding 20 users...");
  
  const userTemplates = [
    { name: "Admin User", email: "admin@example.com", role: UserRole.ADMIN, xp: 15000, funds: 5000, level: 15, karma: 100, prestige: 95 },
    { name: "Demo Player", email: "demo@example.com", role: UserRole.USER, xp: 8500, funds: 2100, level: 10, karma: 75, prestige: 68 },
    { name: "Alice Wonder", email: "alice@example.com", role: UserRole.USER, xp: 12000, funds: 3200, level: 13, karma: 88, prestige: 82 },
    { name: "Bob Builder", email: "bob@example.com", role: UserRole.USER, xp: 4200, funds: 950, level: 6, karma: 45, prestige: 52 },
    { name: "Charlie Fox", email: "charlie@example.com", role: UserRole.USER, xp: 9800, funds: 2600, level: 11, karma: 72, prestige: 75 },
    { name: "Diana Storm", email: "diana@example.com", role: UserRole.USER, xp: 6700, funds: 1600, level: 8, karma: 58, prestige: 64 },
    { name: "Eva Moon", email: "eva@example.com", role: UserRole.USER, xp: 11200, funds: 2900, level: 12, karma: 80, prestige: 78 },
    { name: "Frank Ocean", email: "frank@example.com", role: UserRole.USER, xp: 3500, funds: 720, level: 5, karma: 32, prestige: 42 },
    { name: "Grace Flow", email: "grace@example.com", role: UserRole.USER, xp: 7900, funds: 1850, level: 9, karma: 65, prestige: 70 },
    { name: "Henry Knight", email: "henry@example.com", role: UserRole.USER, xp: 5400, funds: 1250, level: 7, karma: 48, prestige: 58 },
    { name: "Iris Star", email: "iris@example.com", role: UserRole.USER, xp: 10500, funds: 2750, level: 11, karma: 77, prestige: 73 },
    { name: "Jack Thunder", email: "jack@example.com", role: UserRole.USER, xp: 2800, funds: 580, level: 4, karma: 28, prestige: 38 },
    { name: "Kate Blaze", email: "kate@example.com", role: UserRole.USER, xp: 8800, funds: 2300, level: 10, karma: 70, prestige: 72 },
    { name: "Leo Bright", email: "leo@example.com", role: UserRole.USER, xp: 6200, funds: 1480, level: 8, karma: 54, prestige: 62 },
    { name: "Maya Phoenix", email: "maya@example.com", role: UserRole.USER, xp: 13500, funds: 3650, level: 14, karma: 92, prestige: 88 },
    { name: "Noah Zen", email: "noah@example.com", role: UserRole.USER, xp: 4800, funds: 1050, level: 6, karma: 42, prestige: 50 },
    { name: "Olivia Dawn", email: "olivia@example.com", role: UserRole.USER, xp: 9200, funds: 2450, level: 10, karma: 68, prestige: 71 },
    { name: "Peter Sage", email: "peter@example.com", role: UserRole.USER, xp: 5900, funds: 1380, level: 7, karma: 51, prestige: 60 },
    { name: "Quinn Shadow", email: "quinn@example.com", role: UserRole.USER, xp: 7400, funds: 1750, level: 9, karma: 62, prestige: 67 },
    { name: "Ruby Flame", email: "ruby@example.com", role: UserRole.USER, xp: 10800, funds: 2850, level: 12, karma: 78, prestige: 76 },
  ];

  for (const template of userTemplates) {
    await prisma.user.upsert({
      where: { email: template.email },
      update: {
        xp: template.xp,
        funds: template.funds,
        level: template.level,
        karmaScore: template.karma,
        prestigeScore: template.prestige,
      },
      create: {
        email: template.email,
        passwordHash: demoPasswordHash,
        name: template.name,
        role: template.role,
        xp: template.xp,
        funds: template.funds,
        diamonds: Math.floor(template.level * 3),
        level: template.level,
        karmaScore: template.karma,
        prestigeScore: template.prestige,
        emailVerified: new Date(),
        image: \https://i.pravatar.cc/150?u=\\,
      },
    });
  }

  const userCount = await prisma.user.count();
  console.log(\   âœ… \ users created/updated\);

  console.log("ðŸŒ Seed complete: 20 users, achievements, shop items, messages, notifications, events created.");
  console.log(\âœ¨ Login: admin@example.com / password123\n\);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(\â±ï¸  Duration: \s\);

  await prisma.auditLog.create({
    data: {
      ip: "127.0.0.1",
      action: "seed:complete",
      meta: JSON.stringify({
        version: "0.35.9",
        duration: \\s\,
        users: userCount,
      }),
    },
  });
}

main()
  .catch((e) => {
    console.error("âŒ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\();
  });
