import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { UserRole, QuestionType } from "@parel/db/client";
import { hash } from "bcryptjs";
import { seedAchievements } from "@/lib/seed-achievements";

// Utility to log audit

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
async function logAudit(type: string, message: string, meta?: any, userId?: string) {
  await prisma.auditLog.create({
    data: {
      userId: userId || null,
      ip: "127.0.0.1",
      action: type,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
}

// Seeding modules (same as seed.ts)
async function seedUsers() {
  const demoPasswordHash = await hash("password123", 10);
  const users = [];

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      passwordHash: demoPasswordHash,
      name: "Demo Admin",
      role: UserRole.ADMIN,
      xp: 5000,
      funds: 500,
      diamonds: 50,
      level: 10,
      emailVerified: new Date(),
    },
    create: {
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
      name: "Demo Admin",
      role: UserRole.ADMIN,
      xp: 5000,
      funds: 500,
      diamonds: 50,
      level: 10,
      emailVerified: new Date(),
      image: "https://i.pravatar.cc/150?u=admin@example.com",
    },
  });
  users.push(adminUser);

  // Demo users
  for (let i = 1; i <= 10; i++) {
    const email = `demo${i}@parel.app`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        xp: Math.floor(Math.random() * 3000) + 100,
        funds: Math.floor(Math.random() * 300) + 50,
        diamonds: Math.floor(Math.random() * 20),
        level: Math.floor(Math.random() * 8) + 1,
      },
      create: {
        email,
        passwordHash: demoPasswordHash,
        name: `Demo User ${i}`,
        role: UserRole.USER,
        xp: Math.floor(Math.random() * 3000) + 100,
        funds: Math.floor(Math.random() * 300) + 50,
        diamonds: Math.floor(Math.random() * 20),
        level: Math.floor(Math.random() * 8) + 1,
        emailVerified: new Date(),
        image: `https://i.pravatar.cc/150?u=demo${i}@parel.app`,
      },
    });
    users.push(user);
  }

  return users;
}

async function seedMessages(users: any[]) {
  if (users.length < 2) return 0;

  const messageTemplates = [
    "Hey! How's it going?",
    "Did you complete the flow today?",
    "Nice work on the leaderboard! 🏆",
    "Want to team up for the next challenge?",
    "Thanks for the help earlier!",
  ];

  let count = 0;
  for (let i = 0; i < 25; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    if (sender.id === receiver.id) continue;

    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
        isRead: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
    count++;
  }

  return count;
}

async function seedQuestions() {
  // Get or create category structure
  let category = await prisma.category.findFirst({ where: { name: "Demo Category" } });
  if (!category) {
    category = await prisma.category.create({ data: { name: "Demo Category" } });
  }

  let subCategory = await prisma.subCategory.findFirst({ 
    where: { name: "Demo SubCategory", categoryId: category.id } 
  });
  if (!subCategory) {
    subCategory = await prisma.subCategory.create({ 
      data: { name: "Demo SubCategory", categoryId: category.id } 
    });
  }

  let subSubCategory = await prisma.subSubCategory.findFirst({ 
    where: { name: "Demo SubSub", subCategoryId: subCategory.id } 
  });
  if (!subSubCategory) {
    subSubCategory = await prisma.subSubCategory.create({ 
      data: { name: "Demo SubSub", subCategoryId: subCategory.id } 
    });
  }

  let leaf = await prisma.sssCategory.findFirst({ 
    where: { name: "Demo Leaf", subSubCategoryId: subSubCategory.id } 
  });
  if (!leaf) {
    leaf = await prisma.sssCategory.create({ 
      data: { name: "Demo Leaf", subSubCategoryId: subSubCategory.id } 
    });
  }

  const questions = [
    {
      text: "What motivates you the most?",
      locale: "en",
      options: [
        { label: "Achievement", value: "achievement", order: 0 },
        { label: "Recognition", value: "recognition", order: 1 },
        { label: "Learning", value: "learning", order: 2 },
      ]
    },
    {
      text: "How do you handle feedback?",
      locale: "en",
      options: [
        { label: "Embrace it", value: "embrace", order: 0 },
        { label: "Analyze it", value: "analyze", order: 1 },
        { label: "Act on it", value: "act", order: 2 },
      ]
    },
  ];

  let count = 0;
  for (const q of questions) {
    const existing = await prisma.flowQuestion.findFirst({
      where: { text: q.text, locale: q.locale }
    });

    if (!existing) {
      await prisma.flowQuestion.create({
        data: {
          text: q.text,
          locale: q.locale,
          categoryId: leaf.id,
          type: QuestionType.SINGLE_CHOICE,
          isActive: true,
          options: {
            create: q.options,
          },
        },
      });
      count++;
    }
  }

  return count;
}

// Main seed handler
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const startTime = Date.now();
    
    // Run seeding modules
    const users = await seedUsers();
    const messagesCount = await seedMessages(users);
    const questionsCount = await seedQuestions();
    
    // Seed achievements (v0.35.7)
    await seedAchievements();
    const achievementsCount = await prisma.achievement.count();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Log audit
    await logAudit(
      "admin:seed-db",
      `Seeder 2.0 executed via admin panel`,
      {
        users: users.length,
        messages: messagesCount,
        questions: questionsCount,
        achievements: achievementsCount,
        duration: `${duration}s`,
      },
      session.user.id
    );

    // Also log to ActionLog for admin tracking
    await prisma.actionLog.create({
      data: {
        userId: session.user.id,
        action: "seed-db",
        metadata: {
          users: users.length,
          messages: messagesCount,
          questions: questionsCount,
          achievements: achievementsCount,
          duration: `${duration}s`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        users: users.length,
        messages: messagesCount,
        questions: questionsCount,
        achievements: achievementsCount,
        duration: `${duration}s`,
      },
    });
  } catch (error) {
    console.error("[API] Seed DB error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed database" },
      { status: 500 }
    );
  }
}













