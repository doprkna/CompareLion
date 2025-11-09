import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { safeAsync, unauthorizedError, forbiddenError } from "@/lib/api-handler";
import { seedAchievements } from "@/lib/seed-achievements";
import { hash } from "bcryptjs";
import { UserRole, QuestionType } from "@parel/db/client";

export const POST = safeAsync(async (req: NextRequest) => {
  console.log("🔁 [Reseed] Request received from admin...");

    // Only allow in development
    if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ [Reseed] Blocked - production environment");
    return forbiddenError("Reseed not allowed in production");
    }

    ensurePrismaClient();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
    console.warn("⚠️ [Reseed] No session found");
    return unauthorizedError();
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
    console.warn("⚠️ [Reseed] Non-admin user attempted reseed");
    return forbiddenError("Admin access required");
  }

  console.log("✅ [Reseed] Admin authenticated, starting comprehensive seed...");

  // Run comprehensive seeding (v0.35.9 - full demo world)
  const startTime = Date.now();
  const results = {
    users: 0,
    achievements: 0,
    items: 0,
    messages: 0,
    notifications: 0,
    questions: 0,
    events: 0,
    leaderboard: 0,
    errors: [] as string[],
  };

  const demoPasswordHash = await hash("password123", 10);

  // =====================================================================
  // 1. SEED 20 USERS
  // =====================================================================
  console.log("👥 [Reseed] Seeding 20 users...");
  try {
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
        image: `https://i.pravatar.cc/150?u=${template.email}`,
      },
    });
  }

  results.users = await prisma.user.count();
  console.log(`   ✅ ${results.users} users created/updated`);
  } catch (err) {
    console.error("❌ [Reseed] User seeding failed:", err);
    results.errors.push("Users: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 2. SEED ACHIEVEMENTS
  // =====================================================================
  console.log("🏆 [Reseed] Seeding achievements...");
  try {
    await seedAchievements();
    results.achievements = await prisma.achievement.count();
    console.log(`   ✅ ${results.achievements} achievements created/updated`);
  } catch (err) {
    console.error("❌ [Reseed] Achievement seeding failed:", err);
    results.errors.push("Achievements: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 3. SEED 8 SHOP ITEMS
  // =====================================================================
  console.log("📦 [Reseed] Seeding shop items...");
  try {
    const items = [
      { key: "bronze-badge", name: "Bronze Badge", type: "badge", rarity: "common", description: "A basic bronze badge", goldPrice: 100, emoji: "🥉", isShopItem: true },
      { key: "silver-badge", name: "Silver Badge", type: "badge", rarity: "uncommon", description: "A shiny silver badge", goldPrice: 300, emoji: "🥈", isShopItem: true },
      { key: "golden-badge", name: "Golden Badge", type: "badge", rarity: "rare", description: "A prestigious golden badge", goldPrice: 800, emoji: "🥇", isShopItem: true },
      { key: "legendary-crown", name: "Legendary Crown", type: "badge", rarity: "legendary", description: "The ultimate status symbol", goldPrice: 2000, emoji: "👑", isShopItem: true },
      { key: "xp-booster", name: "XP Booster", type: "consumable", rarity: "uncommon", description: "Doubles XP gain for 1 hour", goldPrice: 500, emoji: "⚡", isShopItem: true },
      { key: "coin-pack", name: "Coin Pack", type: "consumable", rarity: "common", description: "Instant 500 gold", goldPrice: 250, emoji: "💰", isShopItem: true },
      { key: "crystal-aura", name: "Crystal Aura", type: "accessory", rarity: "rare", description: "Glowing crystal effect", goldPrice: 1200, emoji: "💎", isShopItem: true },
      { key: "dragon-emblem", name: "Dragon Emblem", type: "badge", rarity: "legendary", description: "Mark of a dragon slayer", goldPrice: 3500, emoji: "🐉", isShopItem: true },
    ];

  for (const itemData of items) {
    await prisma.item.upsert({
      where: { key: itemData.key },
      update: {
        name: itemData.name,
        type: itemData.type,
        rarity: itemData.rarity,
        description: itemData.description,
        goldPrice: itemData.goldPrice,
        emoji: itemData.emoji,
        isShopItem: itemData.isShopItem,
      },
      create: itemData,
    });
  }

  results.items = await prisma.item.count();
  console.log(`   ✅ ${results.items} shop items created/updated`);
  } catch (err) {
    console.error("❌ [Reseed] Item seeding failed:", err);
    results.errors.push("Items: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 4. SEED 10 QUESTIONS
  // =====================================================================
  console.log("❓ [Reseed] Seeding questions...");
  try {
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

    const questionTemplates = [
      { text: "How often do you exercise per week?", options: [
        { label: "Never", value: "0", order: 0 },
        { label: "1-2 times", value: "1-2", order: 1 },
        { label: "3-4 times", value: "3-4", order: 2 },
        { label: "5+ times", value: "5+", order: 3 },
      ]},
      { text: "What motivates you the most?", options: [
        { label: "Achievement", value: "achievement", order: 0 },
        { label: "Recognition", value: "recognition", order: 1 },
        { label: "Learning", value: "learning", order: 2 },
        { label: "Impact", value: "impact", order: 3 },
      ]},
      { text: "How do you handle feedback?", options: [
        { label: "Embrace it", value: "embrace", order: 0 },
        { label: "Analyze it", value: "analyze", order: 1 },
        { label: "Reflect on it", value: "reflect", order: 2 },
        { label: "Act on it", value: "act", order: 3 },
      ]},
      { text: "What's your preferred work style?", options: [
        { label: "Solo focus", value: "solo", order: 0 },
        { label: "Team collaboration", value: "team", order: 1 },
        { label: "Mix of both", value: "mix", order: 2 },
        { label: "Depends on task", value: "flexible", order: 3 },
      ]},
      { text: "How many hours do you sleep on average?", options: [
        { label: "Less than 6", value: "<6", order: 0 },
        { label: "6-7 hours", value: "6-7", order: 1 },
        { label: "7-8 hours", value: "7-8", order: 2 },
        { label: "8+ hours", value: "8+", order: 3 },
      ]},
      { text: "What's your communication style?", options: [
        { label: "Direct and clear", value: "direct", order: 0 },
        { label: "Diplomatic", value: "diplomatic", order: 1 },
        { label: "Casual and friendly", value: "casual", order: 2 },
        { label: "Formal", value: "formal", order: 3 },
      ]},
      { text: "How do you approach new challenges?", options: [
        { label: "Jump right in", value: "action", order: 0 },
        { label: "Research first", value: "research", order: 1 },
        { label: "Seek advice", value: "advice", order: 2 },
        { label: "Plan carefully", value: "plan", order: 3 },
      ]},
      { text: "What's your ideal learning method?", options: [
        { label: "Reading books", value: "reading", order: 0 },
        { label: "Video tutorials", value: "video", order: 1 },
        { label: "Hands-on practice", value: "practice", order: 2 },
        { label: "Group discussions", value: "group", order: 3 },
      ]},
      { text: "How do you manage stress?", options: [
        { label: "Exercise", value: "exercise", order: 0 },
        { label: "Meditation", value: "meditation", order: 1 },
        { label: "Talk to friends", value: "social", order: 2 },
        { label: "Take breaks", value: "breaks", order: 3 },
      ]},
      { text: "What's your approach to goal setting?", options: [
        { label: "Big ambitious goals", value: "ambitious", order: 0 },
        { label: "Small achievable steps", value: "incremental", order: 1 },
        { label: "Flexible targets", value: "flexible", order: 2 },
        { label: "No specific goals", value: "flow", order: 3 },
      ]},
    ];

  for (const q of questionTemplates) {
    const existing = await prisma.flowQuestion.findFirst({
      where: { text: q.text, locale: "en" }
    });

    if (!existing) {
      await prisma.flowQuestion.create({
        data: {
          text: q.text,
          locale: "en",
          categoryId: leaf.id,
          type: QuestionType.SINGLE_CHOICE,
          isActive: true,
          options: {
            create: q.options,
          },
        },
      });
    }
  }

  results.questions = await prisma.flowQuestion.count();
  console.log(`   ✅ ${results.questions} questions in database`);
  } catch (err) {
    console.error("❌ [Reseed] Question seeding failed:", err);
    results.errors.push("Questions: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 5. SEED 10 MESSAGES
  // =====================================================================
  console.log("💬 [Reseed] Seeding messages...");
  try {
    const allUsers = await prisma.user.findMany();
  const messageTemplates = [
    "Hey! How's it going?",
    "Nice work on the leaderboard! 🏆",
    "Want to team up for the next challenge?",
    "Thanks for the help earlier!",
    "Just unlocked a new badge! 🎉",
    "The shop has some amazing items today",
    "See you at the top!",
    "Good luck with your goals!",
    "Let's connect and share strategies",
    "Did you complete the flow today?",
  ];

  if (allUsers.length >= 2) {
    for (let i = 0; i < 10; i++) {
      const sender = allUsers[i % allUsers.length];
      const receiver = allUsers[(i + 5) % allUsers.length];
      
      if (sender.id !== receiver.id) {
        await prisma.message.create({
          data: {
            senderId: sender.id,
            receiverId: receiver.id,
            content: messageTemplates[i],
            isRead: Math.random() > 0.5,
            createdAt: new Date(Date.now() - (i * 3600000)),
          },
        });
      }
    }
  }

  results.messages = await prisma.message.count();
  console.log(`   ✅ ${results.messages} messages created`);
  } catch (err) {
    console.error("❌ [Reseed] Message seeding failed:", err);
    results.errors.push("Messages: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 6. SEED 25 NOTIFICATIONS (5 types × 5 users)
  // =====================================================================
  console.log("🔔 [Reseed] Seeding notifications...");
  try {
    const allUsers = await prisma.user.findMany();
  const notifTemplates = [
    { title: "Welcome to PareL!", content: "Your adventure starts today. Complete your profile to get started!" },
    { title: "Shop Update", content: "New legendary items available! Check out the Dragon Emblem." },
    { title: "Event Incoming", content: "Prepare for Winter Season Challenge! Starts soon." },
    { title: "Survey", content: "Vote on new feature ideas. Your feedback shapes PareL!" },
    { title: "Maintenance", content: "System maintenance scheduled tonight. Expect 30min downtime." },
  ];

  for (const notif of notifTemplates) {
    for (let i = 0; i < Math.min(5, allUsers.length); i++) {
      await prisma.notification.create({
        data: {
          userId: allUsers[i].id,
          type: "system",
          title: notif.title,
          body: notif.content, // Fixed: was 'message', should be 'body'
          isRead: Math.random() > 0.7,
          createdAt: new Date(Date.now() - (i * 86400000)),
        },
      });
    }
  }

  results.notifications = await prisma.notification.count();
  console.log(`   ✅ ${results.notifications} notifications created`);
  } catch (err) {
    console.error("❌ [Reseed] Notification seeding failed:", err);
    results.errors.push("Notifications: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 7. SEED 1 WORLD EVENT
  // =====================================================================
  console.log("🌍 [Reseed] Seeding world event...");
  try {
  await prisma.globalEvent.upsert({
    where: { id: 1 },
    update: {
      title: "Winter Festival",
      description: "Limited-time challenges and rewards! Complete daily quests for exclusive items.",
      emoji: "❄️",
      type: "seasonal",
      bonusType: "percentage",
      bonusValue: 25,
      targetScope: "all",
      startAt: new Date(Date.now() - 86400000),
      endAt: new Date(Date.now() + (7 * 86400000)),
      active: true,
    },
    create: {
      title: "Winter Festival",
      description: "Limited-time challenges and rewards! Complete daily quests for exclusive items.",
      emoji: "❄️",
      type: "seasonal",
      bonusType: "percentage",
      bonusValue: 25,
      targetScope: "all",
      startAt: new Date(Date.now() - 86400000),
      endAt: new Date(Date.now() + (7 * 86400000)),
      active: true,
    },
  });

  results.events = await prisma.globalEvent.count({ where: { active: true } });
  console.log(`   ✅ ${results.events} active event(s) created`);
  } catch (err) {
    console.error("❌ [Reseed] Event seeding failed:", err);
    results.errors.push("Events: " + (err instanceof Error ? err.message : String(err)));
  }

  // =====================================================================
  // 8. SEED LEADERBOARD ENTRIES
  // =====================================================================
  console.log("🏅 [Reseed] Seeding leaderboard...");
  try {
    const allUsers = await prisma.user.findMany();
    for (const user of allUsers) {
      try {
        await prisma.leaderboardEntry.create({
          data: {
            userId: user.id,
            score: user.xp,
            rank: 0,
          },
        });
      } catch (e) {
        // Skip if exists
      }
    }

  results.leaderboard = await prisma.leaderboardEntry.count();
  console.log(`   ✅ ${results.leaderboard} leaderboard entries created`);
  } catch (err) {
    console.error("❌ [Reseed] Leaderboard seeding failed:", err);
    results.errors.push("Leaderboard: " + (err instanceof Error ? err.message : String(err)));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ [Reseed] Complete! Duration: ${duration}s`);
  console.log(`📊 [Reseed] Final Stats:`, results);

  if (results.errors.length > 0) {
    console.warn("⚠️ [Reseed] Some operations failed:", results.errors);
  }

  // Build detailed message
  const successItems = [];
  if (results.users > 0) successItems.push(`👥 ${results.users} users`);
  if (results.achievements > 0) successItems.push(`🏆 ${results.achievements} achievements`);
  if (results.items > 0) successItems.push(`📦 ${results.items} shop items`);
  if (results.questions > 0) successItems.push(`❓ ${results.questions} questions`);
  if (results.messages > 0) successItems.push(`💬 ${results.messages} messages`);
  if (results.notifications > 0) successItems.push(`🔔 ${results.notifications} notifications`);
  if (results.events > 0) successItems.push(`🌍 ${results.events} active events`);
  if (results.leaderboard > 0) successItems.push(`🏅 ${results.leaderboard} leaderboard entries`);

  const detailedMessage = results.errors.length === 0
    ? `Database reseeded successfully!\n\nCreated: ${successItems.join(', ')}`
    : `Database partially reseeded (${results.errors.length} errors)\n\nCreated: ${successItems.join(', ')}\n\nErrors: ${results.errors.join(', ')}`;

  return NextResponse.json({
    success: true,
    message: detailedMessage,
    summary: successItems.join(', '),
    stats: {
      users: results.users,
      achievements: results.achievements,
      items: results.items,
      messages: results.messages,
      notifications: results.notifications,
      questions: results.questions,
      events: results.events,
      leaderboard: results.leaderboard,
      duration: `${duration}s`,
      errors: results.errors.length > 0 ? results.errors : undefined,
    },
  });
});











