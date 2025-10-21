/**
 * Seeder 2.0 - Modular Database Seeding
 * 
 * Creates comprehensive demo data with audit logging:
 * - Users (with ADMIN and regular roles)
 * - Messages (cross-user communication)
 * - Flow questions (multi-language)
 * - Badges and achievements
 * - Audit logs for tracking
 */

import { PrismaClient, UserRole, QuestionType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function logAudit(type: string, message: string, meta?: any) {
  await prisma.auditLog.create({
    data: {
      ip: "127.0.0.1",
      action: type,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });
  console.log(`📝 [AUDIT] ${type}: ${message}`);
}

// ============================================================================
// SEEDING MODULES
// ============================================================================

async function seedUsers() {
  console.log("\n👥 Seeding users...");
  
  const demoPasswordHash = await hash("password123", 10);
  const users = [];

  // Create admin user (demo@example.com)
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

  // Create 10 demo users with varying XP/funds and scores
  for (let i = 1; i <= 10; i++) {
    const email = `demo${i}@parel.app`;
    const xp = Math.floor(Math.random() * 3000) + 100;
    const level = Math.floor(Math.random() * 8) + 1;
    
    // Generate karma (-20 to +50 range for variety)
    const karma = Math.floor(Math.random() * 70) - 20;
    
    // Generate prestige based on level (0-60 range)
    const prestige = Math.floor(level * 5 + Math.random() * 20);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        xp,
        funds: Math.floor(Math.random() * 300) + 50,
        diamonds: Math.floor(Math.random() * 20),
        level,
        karmaScore: karma,
        prestigeScore: prestige,
      },
      create: {
        email,
        passwordHash: demoPasswordHash,
        name: `Demo User ${i}`,
        role: UserRole.USER,
        xp,
        funds: Math.floor(Math.random() * 300) + 50,
        diamonds: Math.floor(Math.random() * 20),
        level,
        karmaScore: karma,
        prestigeScore: prestige,
        emailVerified: new Date(),
        image: `https://i.pravatar.cc/150?u=demo${i}@parel.app`,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created/updated ${users.length} users (1 admin, ${users.length - 1} regular)`);
  await logAudit("seed:users", `Seeded ${users.length} users`, { count: users.length });
  
  return users;
}

async function seedMessages(users: any[]) {
  console.log("\n💬 Seeding messages...");
  
  if (users.length < 2) {
    console.log("⚠️  Need at least 2 users to create messages. Skipping.");
    return;
  }

  const messageTemplates = [
    "Hey! How's it going?",
    "Did you complete the flow today?",
    "Nice work on the leaderboard! 🏆",
    "Want to team up for the next challenge?",
    "Thanks for the help earlier!",
    "What's your strategy for earning XP?",
    "I just unlocked a new badge! 🎉",
    "The new questions are really interesting.",
    "See you at the top of the leaderboard!",
    "Good luck with your goals this week!",
  ];

  let messageCount = 0;
  const targetMessages = 30;

  for (let i = 0; i < targetMessages; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    
    // Avoid self-messaging
    if (sender.id === receiver.id) continue;

    const content = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    
    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content,
        isRead: Math.random() > 0.5, // 50% chance of being read
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      },
    });
    messageCount++;
  }

  console.log(`✅ Created ${messageCount} messages`);
  await logAudit("seed:messages", `Seeded ${messageCount} messages`, { count: messageCount });
}

async function seedQuestions() {
  console.log("\n❓ Seeding flow questions...");

  // Get or create a demo category
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

  // English questions
  const englishQuestions = [
    {
      text: "How often do you exercise per week?",
      options: [
        { label: "Never", value: "0", order: 0 },
        { label: "1-2 times", value: "1-2", order: 1 },
        { label: "3-4 times", value: "3-4", order: 2 },
        { label: "5+ times", value: "5+", order: 3 },
      ]
    },
    {
      text: "What's your preferred work environment?",
      options: [
        { label: "Office", value: "office", order: 0 },
        { label: "Home", value: "home", order: 1 },
        { label: "Hybrid", value: "hybrid", order: 2 },
        { label: "Coworking space", value: "coworking", order: 3 },
      ]
    },
    {
      text: "How many hours do you sleep on average?",
      options: [
        { label: "Less than 6", value: "<6", order: 0 },
        { label: "6-7 hours", value: "6-7", order: 1 },
        { label: "7-8 hours", value: "7-8", order: 2 },
        { label: "8+ hours", value: "8+", order: 3 },
      ]
    },
    {
      text: "What motivates you the most?",
      options: [
        { label: "Achievement", value: "achievement", order: 0 },
        { label: "Recognition", value: "recognition", order: 1 },
        { label: "Learning", value: "learning", order: 2 },
        { label: "Impact", value: "impact", order: 3 },
      ]
    },
    {
      text: "How do you handle feedback?",
      options: [
        { label: "Embrace it", value: "embrace", order: 0 },
        { label: "Analyze it", value: "analyze", order: 1 },
        { label: "Reflect on it", value: "reflect", order: 2 },
        { label: "Act on it immediately", value: "act", order: 3 },
      ]
    },
  ];

  let questionCount = 0;
  for (const q of englishQuestions) {
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
      questionCount++;
    }
  }

  // Czech questions
  const czechQuestions = [
    {
      text: "Jak často cvičíte týdně?",
      options: [
        { label: "Nikdy", value: "0", order: 0 },
        { label: "1-2krát", value: "1-2", order: 1 },
        { label: "3-4krát", value: "3-4", order: 2 },
        { label: "5+ krát", value: "5+", order: 3 },
      ]
    },
    {
      text: "Co vás nejvíce motivuje?",
      options: [
        { label: "Úspěch", value: "achievement", order: 0 },
        { label: "Uznání", value: "recognition", order: 1 },
        { label: "Učení", value: "learning", order: 2 },
        { label: "Dopad", value: "impact", order: 3 },
      ]
    },
  ];

  for (const q of czechQuestions) {
    const existing = await prisma.flowQuestion.findFirst({
      where: { text: q.text, locale: "cs" }
    });

    if (!existing) {
      await prisma.flowQuestion.create({
        data: {
          text: q.text,
          locale: "cs",
          categoryId: leaf.id,
          type: QuestionType.SINGLE_CHOICE,
          isActive: true,
          options: {
            create: q.options,
          },
        },
      });
      questionCount++;
    }
  }

  console.log(`✅ Created ${questionCount} new flow questions`);
  await logAudit("seed:questions", `Seeded ${questionCount} questions`, { count: questionCount });
}

async function seedBadges() {
  console.log("\n🏅 Seeding badges...");

  const badges = [
    {
      slug: "first-purchase",
      title: "First Purchase",
      description: "Made your first purchase in the shop",
      icon: "🛒",
    },
    {
      slug: "big-spender",
      title: "Big Spender",
      description: "Spent over 1000 funds in total",
      icon: "💎",
    },
    {
      slug: "subscriber",
      title: "Subscriber",
      description: "Active subscription holder",
      icon: "⭐",
    },
    {
      slug: "streak-master",
      title: "Streak Master",
      description: "Maintained a 7-day streak",
      icon: "🔥",
    },
    {
      slug: "social-butterfly",
      title: "Social Butterfly",
      description: "Sent 50 messages",
      icon: "💬",
    },
  ];

  let badgeCount = 0;
  for (const badgeData of badges) {
    await prisma.badge.upsert({
      where: { slug: badgeData.slug },
      update: badgeData,
      create: badgeData,
    });
    badgeCount++;
  }

  console.log(`✅ Created/updated ${badgeCount} badges`);
  await logAudit("seed:badges", `Seeded ${badgeCount} badges`, { count: badgeCount });
}

async function seedItems() {
  console.log("\n📦 Seeding items...");

  const items = [
    {
      name: "Iron Sword",
      type: "weapon",
      rarity: "common",
      description: "A basic iron sword",
      power: 5,
      icon: "⚔️",
    },
    {
      name: "Steel Sword",
      type: "weapon",
      rarity: "uncommon",
      description: "A well-crafted steel blade",
      power: 10,
      icon: "⚔️",
    },
    {
      name: "Healing Potion",
      type: "consumable",
      rarity: "common",
      description: "Restores 20 HP",
      effect: "heal:20",
      icon: "🧪",
    },
    {
      name: "Mana Potion",
      type: "consumable",
      rarity: "common",
      description: "Restores 30 MP",
      effect: "mana:30",
      icon: "💙",
    },
    {
      name: "Leather Armor",
      type: "armor",
      rarity: "uncommon",
      description: "Light protective armor",
      defense: 3,
      icon: "🛡️",
    },
    {
      name: "Crystal Ring",
      type: "accessory",
      rarity: "rare",
      description: "Increases XP gain",
      bonus: "xp:10%",
      icon: "💍",
    },
    {
      name: "Dragon Scale Shield",
      type: "armor",
      rarity: "epic",
      description: "Legendary defensive gear",
      defense: 15,
      icon: "🛡️",
    },
    {
      name: "Excalibur",
      type: "weapon",
      rarity: "legendary",
      description: "The sword of legends",
      power: 50,
      icon: "⚔️",
    },
  ];

  let itemCount = 0;
  const createdItems = [];
  
  for (const itemData of items) {
    const item = await prisma.item.upsert({
      where: { name: itemData.name },
      update: itemData,
      create: itemData,
    });
    createdItems.push(item);
    itemCount++;
  }

  console.log(`✅ Created/updated ${itemCount} items`);
  await logAudit("seed:items", `Seeded ${itemCount} items`, { count: itemCount });

  return createdItems;
}

async function seedInventories(users: any[], items: any[]) {
  console.log("\n🎒 Seeding user inventories...");

  if (items.length === 0) {
    console.log("⚠️  No items available to seed inventories");
    return;
  }

  let inventoryCount = 0;

  for (const user of users) {
    // Give each user 2-4 random items
    const itemsToGive = Math.floor(Math.random() * 3) + 2; // 2-4 items
    
    for (let i = 0; i < itemsToGive; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const quantity = randomItem.type === "consumable" 
        ? Math.floor(Math.random() * 5) + 1  // 1-5 consumables
        : 1; // 1 for equipment

      try {
        await prisma.inventoryItem.upsert({
          where: {
            userId_itemId: {
              userId: user.id,
              itemId: randomItem.id,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            userId: user.id,
            itemId: randomItem.id,
            quantity,
            equipped: false,
          },
        });
        inventoryCount++;
      } catch (err) {
        // Skip if already exists or other error
      }
    }
  }

  console.log(`✅ Created ${inventoryCount} inventory entries`);
  await logAudit("seed:inventories", `Seeded ${inventoryCount} inventory items`, { count: inventoryCount });
}

async function seedAchievements() {
  console.log("\n🏆 Seeding achievements...");

  const achievements = [
    {
      code: "first_flow",
      title: "First Flow!",
      description: "Completed your first question flow",
      icon: "🌊",
      xpReward: 50,
    },
    {
      code: "social_butterfly",
      title: "Social Butterfly",
      description: "Sent 10 messages to other users",
      icon: "💬",
      xpReward: 100,
    },
    {
      code: "gold_digger",
      title: "Gold Digger",
      description: "Earned 100 gold",
      icon: "💰",
      xpReward: 75,
    },
    {
      code: "question_master",
      title: "Question Master",
      description: "Answered 50 questions",
      icon: "📚",
      xpReward: 200,
    },
    {
      code: "level_5",
      title: "Rising Star",
      description: "Reached level 5",
      icon: "⭐",
      xpReward: 150,
    },
    {
      code: "level_10",
      title: "Elite Player",
      description: "Reached level 10",
      icon: "👑",
      xpReward: 500,
    },
    {
      code: "streak_7",
      title: "Consistent",
      description: "Maintained a 7-day streak",
      icon: "🔥",
      xpReward: 150,
    },
    {
      code: "streak_30",
      title: "Dedicated",
      description: "Maintained a 30-day streak",
      icon: "🔥🔥",
      xpReward: 1000,
    },
  ];

  let achievementCount = 0;
  for (const achievementData of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievementData.code },
      update: achievementData,
      create: achievementData,
    });
    achievementCount++;
  }

  console.log(`✅ Created/updated ${achievementCount} achievements`);
  await logAudit("seed:achievements", `Seeded ${achievementCount} achievements`, { count: achievementCount });
}

async function seedGroups(users: any[]) {
  console.log("\n🔥 Seeding groups (totems)...");

  const groups = [
    { name: "The Phoenix Alliance", emblem: "🔥", motto: "Rising from the ashes" },
    { name: "Lightning Squad", emblem: "⚡", motto: "Fast and fierce" },
    { name: "Ocean Warriors", emblem: "🌊", motto: "Ride the wave" },
    { name: "Moonlight Guild", emblem: "🌙", motto: "Night brings power" },
    { name: "Star Seekers", emblem: "⭐", motto: "Reach for the stars" },
  ];

  const createdGroups = [];

  for (let i = 0; i < groups.length; i++) {
    const groupData = groups[i];
    const owner = users[i % users.length]; // Assign rotating owners

    // Create group
    const group = await prisma.group.create({
      data: {
        name: groupData.name,
        emblem: groupData.emblem,
        motto: groupData.motto,
        ownerId: owner.id,
        totalXp: 0,
        avgKarma: 0,
        avgPrestige: 0,
      },
    });

    // Add owner as first member
    await prisma.groupMember.create({
      data: {
        userId: owner.id,
        groupId: group.id,
        role: "owner",
      },
    });

    // Add 2-5 additional random members
    const memberCount = Math.floor(Math.random() * 4) + 2; // 2-5 members
    const availableUsers = users.filter(u => u.id !== owner.id);
    const shuffled = availableUsers.sort(() => 0.5 - Math.random());
    const membersToAdd = shuffled.slice(0, Math.min(memberCount, availableUsers.length));

    for (const member of membersToAdd) {
      await prisma.groupMember.create({
        data: {
          userId: member.id,
          groupId: group.id,
          role: "member",
        },
      });
    }

    // Calculate stats
    const members = await prisma.groupMember.findMany({
      where: { groupId: group.id },
      include: { user: { select: { xp: true, karmaScore: true, prestigeScore: true } } },
    });

    const totalXp = members.reduce((sum, m) => sum + (m.user.xp || 0), 0);
    const avgKarma = Math.round(members.reduce((sum, m) => sum + (m.user.karmaScore || 0), 0) / members.length);
    const avgPrestige = Math.round(members.reduce((sum, m) => sum + (m.user.prestigeScore || 0), 0) / members.length);

    await prisma.group.update({
      where: { id: group.id },
      data: { totalXp, avgKarma, avgPrestige },
    });

    // Log activity
    await prisma.groupActivity.create({
      data: {
        groupId: group.id,
        userId: owner.id,
        type: "group_created",
        message: `${owner.name} created the totem`,
      },
    });

    createdGroups.push(group);
    console.log(`✅ Created group: ${group.name} (${members.length} members, ${totalXp} XP)`);
  }

  // Award weekly bonus to top group
  const topGroup = createdGroups.sort((a, b) => b.totalXp - a.totalXp)[0];
  if (topGroup) {
    await prisma.group.update({
      where: { id: topGroup.id },
      data: { weeklyBonus: true },
    });
    console.log(`🏆 ${topGroup.name} is the weekly champion!`);
  }

  await logAudit("seed:groups", "Created demo groups", { count: createdGroups.length });
  return createdGroups;
}

async function seedArchetypeHistory(users: any[]) {
  console.log("\n✨ Seeding archetype evolution history...");

  const archetypes = [
    "The Adventurer",
    "The Scholar",
    "The Bard",
    "The Artist",
    "The Warrior",
    "The Dreamer",
  ];

  let historyCount = 0;

  for (const user of users.slice(0, 5)) {
    // Give first 5 users some history
    const evolutionCount = Math.floor(Math.random() * 3) + 1; // 1-3 evolutions

    for (let i = 0; i < evolutionCount; i++) {
      const previousType = i === 0 ? null : archetypes[Math.floor(Math.random() * archetypes.length)];
      const newType = archetypes[Math.floor(Math.random() * archetypes.length)];

      if (previousType === newType) continue; // Skip if same

      await prisma.userArchetypeHistory.create({
        data: {
          userId: user.id,
          previousType,
          newType,
          reason: "stat_evolution",
          statSnapshot: {
            sleep: Math.floor(Math.random() * 100),
            health: Math.floor(Math.random() * 100),
            social: Math.floor(Math.random() * 100),
            knowledge: Math.floor(Math.random() * 100),
            creativity: Math.floor(Math.random() * 100),
          },
          xpBonus: 50,
          evolvedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        },
      });

      historyCount++;
    }

    console.log(`✅ Added ${evolutionCount} archetype evolutions for ${user.name || user.email}`);
  }

  await logAudit("seed:archetype_history", "Created archetype evolution history", { count: historyCount });
  console.log(`✅ Created ${historyCount} archetype evolution records`);
}

async function seedProfileThemes(users: any[]) {
  console.log("\n🎨 Seeding profile themes...");

  const defaultThemes = ["default", "midnight", "cosmic"];
  let themeCount = 0;

  for (const user of users) {
    // Give each user the default theme + 1-2 random unlocks
    const themesToUnlock = ["default"];
    
    // Random additional themes
    if (Math.random() > 0.5) {
      themesToUnlock.push(defaultThemes[Math.floor(Math.random() * defaultThemes.length)]);
    }

    for (const themeId of themesToUnlock) {
      await prisma.profileTheme.upsert({
        where: {
          userId_themeId: {
            userId: user.id,
            themeId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          themeId,
          isActive: themeId === "default",
          unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
      themeCount++;
    }

    console.log(`✅ Unlocked ${themesToUnlock.length} themes for ${user.name || user.email}`);
  }

  await logAudit("seed:profile_themes", "Created profile themes", { count: themeCount });
  console.log(`✅ Created ${themeCount} theme unlocks`);
}

async function seedMoreAchievements() {
  console.log("\n🏆 Seeding additional achievements...");

  const newAchievements = [
    {
      code: "first_message",
      title: "Social Butterfly",
      description: "Send your first message",
      icon: "💬",
      xpReward: 10,
    },
    {
      code: "ten_flows",
      title: "Flow Master",
      description: "Complete 10 question flows",
      icon: "🌊",
      xpReward: 50,
    },
    {
      code: "week_streak",
      title: "Weekly Warrior",
      description: "Maintain a 7-day login streak",
      icon: "🔥",
      xpReward: 100,
    },
    {
      code: "group_founder",
      title: "Totem Builder",
      description: "Create your first group",
      icon: "🔥",
      xpReward: 50,
    },
    {
      code: "archetype_evolution",
      title: "Identity Shift",
      description: "Evolve to a new archetype",
      icon: "✨",
      xpReward: 50,
    },
    {
      code: "theme_collector",
      title: "Style Icon",
      description: "Unlock 5 profile themes",
      icon: "🎨",
      xpReward: 100,
    },
  ];

  for (const ach of newAchievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }

  console.log(`✅ Created/updated ${newAchievements.length} achievements`);
  await logAudit("seed:achievements_extra", "Created additional achievements", { count: newAchievements.length });
}

async function seedGlobalFeed(users: any[]) {
  console.log("\n🌍 Seeding global feed items...");

  const feedTypes = [
    { type: "achievement", title: "Unlocked First Steps", icon: "🏆", xp: 50 },
    { type: "level_up", title: "Reached level 5!", level: 5 },
    { type: "challenge", title: "Completed a Truth or Dare challenge" },
    { type: "quiz", title: "Aced the Logic quiz", score: "10/10" },
    { type: "group_join", title: "Joined 🔥 The Phoenix Alliance", emblem: "🔥" },
    { type: "duel", title: "Won a duel!", opponent: "Demo User 2" },
  ];

  let feedCount = 0;

  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const feedType = feedTypes[Math.floor(Math.random() * feedTypes.length)];

    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random within last 7 days

    await prisma.globalFeedItem.create({
      data: {
        userId: user.id,
        type: feedType.type,
        title: feedType.title,
        description: (feedType as any).score || undefined,
        metadata: {
          icon: (feedType as any).icon,
          xp: (feedType as any).xp,
          level: (feedType as any).level,
          opponent: (feedType as any).opponent,
          emblem: (feedType as any).emblem,
        },
        reactionsCount: Math.floor(Math.random() * 10), // Random reaction count
        createdAt,
      },
    });

    feedCount++;
  }

  // Add some reactions to feed items
  const feedItems = await prisma.globalFeedItem.findMany({ take: 10 });
  const reactionEmojis = ["❤️", "🔥", "🎉", "🤯"];

  for (const item of feedItems) {
    const numReactions = Math.floor(Math.random() * 5);
    for (let i = 0; i < numReactions; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

      try {
        await prisma.reaction.create({
          data: {
            userId: randomUser.id,
            targetType: "feed",
            targetId: item.id,
            emoji: randomEmoji,
          },
        });
      } catch (e) {
        // Skip if duplicate
      }
    }
  }

  await logAudit("seed:global_feed", "Created global feed items", { count: feedCount });
  console.log(`✅ Created ${feedCount} feed items with reactions`);
}

async function seedDailyQuiz() {
  console.log("\n📝 Seeding daily quiz...");

  // Get available questions
  const questions = await prisma.flowQuestion.findMany({
    where: { locale: "en" },
    take: 10,
  });

  if (questions.length < 3) {
    console.log("⚠️ Not enough questions for quiz");
    return;
  }

  // Create today's quiz
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedIds = questions.slice(0, 3).map((q) => q.id);

  const quiz = await prisma.dailyQuiz.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      questionIds: selectedIds,
      rewardXp: 50,
      rewardHearts: 1,
      completions: Math.floor(Math.random() * 300), // Mock completions
    },
  });

  console.log(`✅ Created daily quiz with ${selectedIds.length} questions`);
  await logAudit("seed:daily_quiz", "Created daily quiz", { quizId: quiz.id, completions: quiz.completions });
}

async function seedUserEnergy(users: any[]) {
  console.log("\n❤️ Seeding user energy...");

  let energyCount = 0;

  for (const user of users) {
    const hearts = Math.floor(Math.random() * 6); // 0-5 hearts

    await prisma.userEnergy.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        hearts,
        maxHearts: 5,
        lastRegenAt: new Date(Date.now() - Math.random() * 3600000), // Random within last hour
      },
    });

    energyCount++;
  }

  console.log(`✅ Created energy for ${energyCount} users`);
  await logAudit("seed:user_energy", "Created user energy", { count: energyCount });
}

async function seedCraftingRecipes(items: any[]) {
  console.log("\n🔨 Seeding crafting recipes...");

  const weaponItems = items.filter((i) => i.type === "weapon");
  const armorItems = items.filter((i) => i.type === "armor");

  const recipes = [
    {
      name: "Reinforced Blade",
      description: "Combine two weapons for increased power",
      inputItemIds: weaponItems.slice(0, 2).map((i) => i.id),
      outputItemId: weaponItems[0]?.id || items[0].id,
      goldCost: 100,
      requiresToken: false,
      rarityBoost: 1,
      successRate: 95,
      unlockLevel: 1,
    },
    {
      name: "Enchanted Armor",
      description: "Merge armor pieces for superior defense",
      inputItemIds: armorItems.slice(0, 2).map((i) => i.id),
      outputItemId: armorItems[0]?.id || items[1].id,
      goldCost: 150,
      requiresToken: false,
      rarityBoost: 1,
      successRate: 90,
      unlockLevel: 5,
    },
    {
      name: "Legendary Fusion",
      description: "Combine 3 items into legendary gear",
      inputItemIds: items.slice(0, 3).map((i) => i.id),
      outputItemId: items[0]?.id,
      goldCost: 500,
      requiresToken: true,
      rarityBoost: 2,
      successRate: 75,
      unlockLevel: 10,
    },
  ];

  let recipeCount = 0;

  for (const recipeData of recipes) {
    if (recipeData.inputItemIds.length >= 2 && recipeData.outputItemId) {
      await prisma.craftingRecipe.create({
        data: recipeData,
      });
      recipeCount++;
      console.log(`✅ Created recipe: ${recipeData.name}`);
    }
  }

  await logAudit("seed:crafting_recipes", "Created crafting recipes", { count: recipeCount });
  console.log(`✅ Created ${recipeCount} crafting recipes`);
}

async function seedGlobalEvents() {
  console.log("\n🎉 Seeding global events...");

  const now = new Date();
  
  const events = [
    {
      title: "Courage Week",
      description: "Earn bonus XP on all Dare challenges!",
      emoji: "⚔️",
      type: "xp_boost",
      bonusType: "percentage",
      bonusValue: 25,
      targetScope: "dare",
      startAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
      active: true,
    },
    {
      title: "Knowledge Rush",
      description: "Double XP on all quiz completions!",
      emoji: "📚",
      type: "xp_boost",
      bonusType: "multiplier",
      bonusValue: 2,
      targetScope: "quiz",
      startAt: now,
      endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      title: "Golden Weekend",
      description: "Extra gold on all activities!",
      emoji: "💰",
      type: "gold_boost",
      bonusType: "percentage",
      bonusValue: 50,
      targetScope: "all",
      startAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      active: true,
    },
    {
      title: "Past Event Example",
      description: "This event has ended",
      emoji: "⏰",
      type: "xp_boost",
      bonusType: "percentage",
      bonusValue: 10,
      targetScope: "all",
      startAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      active: false,
    },
  ];

  let eventCount = 0;

  for (const eventData of events) {
    await prisma.globalEvent.create({
      data: eventData,
    });
    eventCount++;
    console.log(`✅ Created event: ${eventData.title} (${eventData.active ? "ACTIVE" : "INACTIVE"})`);
  }

  await logAudit("seed:global_events", "Created global events", { count: eventCount });
  console.log(`✅ Created ${eventCount} global events`);
}

async function seedMarketplace(users: any[], items: any[]) {
  console.log("\n🏪 Seeding marketplace listings...");

  let listingCount = 0;

  // Create 10 random listings from different users
  for (let i = 0; i < 10; i++) {
    const seller = users[Math.floor(Math.random() * users.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const basePrice = item.rarity === "legendary" ? 1000 : item.rarity === "epic" ? 500 : item.rarity === "rare" ? 200 : 100;
    const price = basePrice + Math.floor(Math.random() * 100);
    const currency = Math.random() > 0.8 ? "diamonds" : "gold";

    await prisma.marketListing.create({
      data: {
        sellerId: seller.id,
        itemId: item.id,
        price,
        currency,
        status: "active",
        listedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });

    listingCount++;
  }

  // Initialize global pool
  await prisma.globalPool.upsert({
    where: { poolType: "market_tax" },
    update: {},
    create: {
      poolType: "market_tax",
      goldAmount: Math.floor(Math.random() * 1000),
      diamondAmount: Math.floor(Math.random() * 100),
    },
  });

  await logAudit("seed:marketplace", "Created market listings", { count: listingCount });
  console.log(`✅ Created ${listingCount} market listings`);
}

async function seedDailyQuests(items: any[]) {
  console.log("\n🎯 Seeding daily quests...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const quests = [
    { type: "answer_questions", title: "Question Master", objective: "Answer 5 questions", targetCount: 5, rewardXp: 75, rewardGold: 50 },
    { type: "complete_challenge", title: "Challenge Accepted", objective: "Complete 1 challenge", targetCount: 1, rewardXp: 100, rewardGold: 75 },
    { type: "send_messages", title: "Social Butterfly", objective: "Send 3 messages", targetCount: 3, rewardXp: 40, rewardGold: 20 },
  ];

  let questCount = 0;

  for (const questData of quests) {
    await prisma.dailyQuest.create({
      data: {
        ...questData,
        date: today,
        rewardItem: items[0]?.id,
        dropChance: 10,
        expiresAt: tomorrow,
      },
    });
    questCount++;
    console.log(`✅ Created quest: ${questData.title}`);
  }

  await logAudit("seed:daily_quests", "Created daily quests", { count: questCount });
  console.log(`✅ Created ${questCount} daily quests`);
}

// ============================================================================
// MAIN SEEDER
// ============================================================================

async function main() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║          🌱 SEEDER 2.0 - Starting...              ║");
  console.log("╚════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  try {
    // Seed in order (users first, then dependent data)
    const users = await seedUsers();
    await seedMessages(users);
    await seedQuestions();
    await seedBadges();
    await seedAchievements();
    const items = await seedItems();
    await seedInventories(users, items);
    await seedGroups(users);
    await seedArchetypeHistory(users);
    await seedMoreAchievements();
    await seedProfileThemes(users);
    await seedGlobalFeed(users);
    await seedDailyQuiz();
    await seedUserEnergy(users);
    await seedGlobalEvents();
    await seedCraftingRecipes(items);
    await seedMarketplace(users, items);
    await seedDailyQuests(items);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║          ✅ SEEDER 2.0 COMPLETE!                   ║");
    console.log(`║          Duration: ${duration}s                           ║`);
    console.log("╚════════════════════════════════════════════════════╝\n");

    // Final audit log
    await logAudit("seed:complete", `Seeder 2.0 completed successfully`, { 
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("\n❌ Seeder failed:", error);
    await logAudit("seed:error", `Seeder 2.0 failed`, { 
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
