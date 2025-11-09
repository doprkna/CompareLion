/**
 * Seeder v0.35.8 - Full Demo World Population
 * 
 * Creates comprehensive demo data including:
 * - Users (varied stats for leaderboards)
 * - Achievements (with user unlocks)
 * - Shop items & inventory
 * - Leaderboard entries
 * - Groups/totems
 * - Global feed
 * - Messages
 * - Questions
 * - Badges
 * - Report stats
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
  console.log(\ðŸ“ [AUDIT] \: \\);
}

// ============================================================================
// SEEDING MODULES
// ============================================================================

async function seedUsers() {
  console.log("\nðŸ‘¥ Seeding users...");
  
  const demoPasswordHash = await hash("password123", 10);
  const users = [];

  // Admin user (Level 10, high stats for testing)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash: demoPasswordHash,
      name: "Admin User",
      role: UserRole.ADMIN,
      xp: 12000,
      funds: 2500,
      diamonds: 100,
      level: 10,
      karmaScore: 80,
      prestigeScore: 90,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@example.com",
      passwordHash: demoPasswordHash,
      name: "Admin User",
      role: UserRole.ADMIN,
      xp: 12000,
      funds: 2500,
      diamonds: 100,
      level: 10,
      karmaScore: 80,
      prestigeScore: 90,
      emailVerified: new Date(),
      image: "https://i.pravatar.cc/150?u=admin",
    },
  });
  users.push(adminUser);

  // Demo player (mid-level for testing)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      passwordHash: demoPasswordHash,
      name: "Demo Player",
      role: UserRole.USER,
      xp: 4800,
      funds: 1200,
      diamonds: 30,
      level: 6,
      karmaScore: 45,
      prestigeScore: 50,
      emailVerified: new Date(),
    },
    create: {
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
      name: "Demo Player",
      role: UserRole.USER,
      xp: 4800,
      funds: 1200,
      diamonds: 30,
      level: 6,
      karmaScore: 45,
      prestigeScore: 50,
      emailVerified: new Date(),
      image: "https://i.pravatar.cc/150?u=demo",
    },
  });
  users.push(demoUser);

  // Create variety of users for leaderboard
  const userTemplates = [
    { name: "Mira Fox", email: "mira@example.com", xp: 7800, funds: 1800, level: 8, karma: 60, prestige: 70 },
    { name: "Jay Wolf", email: "jay@example.com", xp: 2200, funds: 300, level: 4, karma: 20, prestige: 30 },
    { name: "Lina Hart", email: "lina@example.com", xp: 1500, funds: 150, level: 3, karma: 15, prestige: 25 },
    { name: "Alex Storm", email: "alex@example.com", xp: 5500, funds: 900, level: 7, karma: 50, prestige: 55 },
    { name: "Nova Bright", email: "nova@example.com", xp: 3200, funds: 600, level: 5, karma: 35, prestige: 40 },
    { name: "Kai Shadow", email: "kai@example.com", xp: 9500, funds: 2100, level: 9, karma: 75, prestige: 80 },
    { name: "Luna Star", email: "luna@example.com", xp: 6400, funds: 1500, level: 7, karma: 55, prestige: 65 },
    { name: "Zara Phoenix", email: "zara@example.com", xp: 8200, funds: 1900, level: 8, karma: 65, prestige: 72 },
    { name: "Finn Ocean", email: "finn@example.com", xp: 4100, funds: 850, level: 6, karma: 40, prestige: 48 },
    { name: "Aria Moon", email: "aria@example.com", xp: 2800, funds: 450, level: 4, karma: 28, prestige: 35 },
    { name: "Blake Thunder", email: "blake@example.com", xp: 5900, funds: 1100, level: 7, karma: 48, prestige: 58 },
    { name: "Ruby Flame", email: "ruby@example.com", xp: 3600, funds: 700, level: 5, karma: 32, prestige: 42 },
    { name: "Echo Whisper", email: "echo@example.com", xp: 7200, funds: 1650, level: 8, karma: 58, prestige: 68 },
    { name: "River Flow", email: "river@example.com", xp: 4500, funds: 950, level: 6, karma: 42, prestige: 52 },
  ];

  for (const template of userTemplates) {
    const user = await prisma.user.upsert({
      where: { email: template.email },
      update: {
        xp: template.xp,
        funds: template.funds,
        diamonds: Math.floor(template.level * 3),
        level: template.level,
        karmaScore: template.karma,
        prestigeScore: template.prestige,
      },
      create: {
        email: template.email,
        passwordHash: demoPasswordHash,
        name: template.name,
        role: UserRole.USER,
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
    users.push(user);
  }

  console.log(\âœ… Created/updated \ users (1 admin, \ regular)\);
  await logAudit("seed:users", \Seeded \ users\, { count: users.length });
  
  return users;
}

async function seedAchievements() {
  console.log("\nðŸ† Seeding achievements...");

  const achievements = [
    // Combat
    { key: "first-blood", code: "first-blood", category: "combat", tier: 1, title: "First Blood", name: "First Kill", description: "Defeat your first shadow enemy", emoji: "âš”ï¸", icon: "âš”ï¸", xpReward: 50, rewardGold: 10 },
    { key: "combat-veteran", code: "combat-veteran-1", category: "combat", tier: 1, title: "Veteran", name: "10 Kills", description: "Defeat 10 shadow enemies", emoji: "ðŸ—¡ï¸", icon: "ðŸ—¡ï¸", xpReward: 100, rewardGold: 25 },
    { key: "boss-breaker", code: "boss-breaker", category: "combat", tier: 1, title: "Boss Breaker", name: "Boss Defeated", description: "Defeat your first boss enemy", emoji: "ðŸ‘‘", icon: "ðŸ‘‘", xpReward: 200, rewardGold: 100 },
    
    // Mind / Reflection
    { key: "reflective-mind", code: "reflective-mind-1", category: "mind", tier: 1, title: "Reflective Mind", name: "10 Reflections", description: "Complete 10 reflection sessions", emoji: "ðŸ§ ", icon: "ðŸ§ ", xpReward: 100, rewardGold: 25 },
    { key: "deep-thinker", code: "deep-thinker", category: "mind", tier: 1, title: "Deep Thinker", name: "Reflection Master", description: "Spend 30 minutes reflecting", emoji: "ðŸ’­", icon: "ðŸ’­", xpReward: 150, rewardGold: 40 },
    
    // Social
    { key: "social-first-post", code: "social-first-post", category: "social", tier: 1, title: "Voice Heard", name: "First Post", description: "Share your first reflection or thought", emoji: "ðŸ’¬", icon: "ðŸ’¬", xpReward: 75, rewardGold: 20 },
    { key: "social-first-comment", code: "social-first-comment", category: "social", tier: 1, title: "Engaged", name: "First Comment", description: "Comment on someone's post", emoji: "ðŸ’­", icon: "ðŸ’­", xpReward: 50, rewardGold: 10 },
    { key: "social-10-replies", code: "social-10-replies", category: "social", tier: 1, title: "Conversationalist", name: "10 Replies", description: "Reply to 10 posts or comments", emoji: "ðŸ’¬", icon: "ðŸ’¬", xpReward: 150, rewardGold: 40 },
    
    // Commerce
    { key: "first-purchase", code: "first-purchase", category: "commerce", tier: 1, title: "First Purchase", name: "First Buy", description: "Make your first shop purchase", emoji: "ðŸ›’", icon: "ðŸ›’", xpReward: 100, rewardGold: 25 },
    { key: "commerce-5-purchases", code: "commerce-5-purchases", category: "commerce", tier: 1, title: "Regular Customer", name: "5 Purchases", description: "Make 5 shop purchases", emoji: "ðŸ’°", icon: "ðŸ’°", xpReward: 200, rewardGold: 50 },
    { key: "first-sale", code: "first-sale", category: "commerce", tier: 1, title: "Entrepreneur", name: "First Sale", description: "Make your first marketplace sale", emoji: "ðŸ’µ", icon: "ðŸ’µ", xpReward: 150, rewardGold: 40 },
    
    // Integration
    { key: "profile-complete", code: "profile-complete", category: "integration", tier: 1, title: "Profile Complete", name: "All Set", description: "Complete all profile fields", emoji: "ðŸ‘¤", icon: "ðŸ‘¤", xpReward: 100, rewardGold: 30 },
    { key: "first-login", code: "first-login", category: "integration", tier: 1, title: "First Steps", name: "First Login", description: "Logged in for the first time", emoji: "ðŸŒŸ", icon: "ðŸŒŸ", xpReward: 50, rewardGold: 10 },
    { key: "shopper", code: "shopper", category: "integration", tier: 1, title: "Shopper", name: "Item Purchased", description: "Bought an item from the shop", emoji: "ðŸ›ï¸", icon: "ðŸ›ï¸", xpReward: 100, rewardGold: 25 },
    { key: "top-10", code: "top-10", category: "integration", tier: 1, title: "Top 10", name: "Leaderboard Elite", description: "Ranked top 10 on the leaderboard", emoji: "ðŸ†", icon: "ðŸ†", xpReward: 1000, rewardGold: 500 },
    { key: "streak-7", code: "streak-7", category: "integration", tier: 1, title: "Week Warrior", name: "7-Day Streak", description: "Maintained a 7-day streak", emoji: "ðŸ”¥", icon: "ðŸ”¥", xpReward: 150, rewardGold: 50 },
  ];

  const createdAchievements = [];
  for (const ach of achievements) {
    const achievement = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
    createdAchievements.push(achievement);
  }

  console.log(\âœ… Created/updated \ achievements\);
  await logAudit("seed:achievements", \Seeded \ achievements\, { count: createdAchievements.length });
  
  return createdAchievements;
}

async function seedUserAchievements(users: any[], achievements: any[]) {
  console.log("\nðŸŽ–ï¸ Assigning achievements to users...");

  let assignedCount = 0;

  // Assign achievements to users based on their level/stats
  for (const user of users) {
    const numAchievements = Math.min(user.level, achievements.length);
    
    for (let i = 0; i < numAchievements; i++) {
      const achievement = achievements[i];
      
      try {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
            tier: 1,
            earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        });
        assignedCount++;
      } catch (e) {
        // Skip if already exists
      }
    }
  }

  console.log(\âœ… Assigned \ achievements to users\);
  await logAudit("seed:user_achievements", \Assigned \ user achievements\, { count: assignedCount });
}

async function seedItems() {
  console.log("\nðŸ“¦ Seeding shop items...");

  const items = [
    // Common items
    { name: "Bronze Badge", type: "badge", rarity: "common", description: "A basic bronze badge", price: 100, icon: "ðŸ¥‰", power: null, defense: null, effect: null, bonus: null },
    { name: "Iron Sword", type: "weapon", rarity: "common", description: "A basic iron sword", price: 150, icon: "ðŸ—¡ï¸", power: 5, defense: null, effect: null, bonus: null },
    { name: "Leather Armor", type: "armor", rarity: "common", description: "Light protective armor", price: 120, icon: "ðŸ›¡ï¸", power: null, defense: 3, effect: null, bonus: null },
    { name: "Health Potion", type: "consumable", rarity: "common", description: "Restores 20 HP", price: 50, icon: "ðŸ§ª", power: null, defense: null, effect: "heal:20", bonus: null },
    
    // Uncommon items
    { name: "Silver Badge", type: "badge", rarity: "uncommon", description: "A shiny silver badge", price: 300, icon: "ðŸ¥ˆ", power: null, defense: null, effect: null, bonus: null },
    { name: "Steel Sword", type: "weapon", rarity: "uncommon", description: "A well-crafted steel blade", price: 400, icon: "âš”ï¸", power: 10, defense: null, effect: null, bonus: null },
    { name: "Chain Mail", type: "armor", rarity: "uncommon", description: "Medium protective armor", price: 350, icon: "ðŸ›¡ï¸", power: null, defense: 7, effect: null, bonus: null },
    { name: "Mana Potion", type: "consumable", rarity: "uncommon", description: "Restores 30 MP", price: 80, icon: "ðŸ’™", power: null, defense: null, effect: "mana:30", bonus: null },
    
    // Rare items
    { name: "Golden Badge", type: "badge", rarity: "rare", description: "A prestigious golden badge", price: 800, icon: "ðŸ¥‡", power: null, defense: null, effect: null, bonus: null },
    { name: "Enchanted Blade", type: "weapon", rarity: "rare", description: "A magically enhanced sword", price: 1000, icon: "âš”ï¸", power: 20, defense: null, effect: null, bonus: "crit:15%" },
    { name: "Plate Armor", type: "armor", rarity: "rare", description: "Heavy protective armor", price: 900, icon: "ðŸ›¡ï¸", power: null, defense: 15, effect: null, bonus: null },
    { name: "Crystal Ring", type: "accessory", rarity: "rare", description: "Increases XP gain", price: 750, icon: "ðŸ’", power: null, defense: null, effect: null, bonus: "xp:10%" },
    
    // Epic items
    { name: "Diamond Badge", type: "badge", rarity: "epic", description: "An extremely rare diamond badge", price: 1500, icon: "ðŸ’Ž", power: null, defense: null, effect: null, bonus: null },
    { name: "Dragon Slayer", type: "weapon", rarity: "epic", description: "Forged from dragon scales", price: 2000, icon: "ðŸ‰", power: 35, defense: null, effect: null, bonus: "dragon:30%" },
    { name: "Dragon Scale Shield", type: "armor", rarity: "epic", description: "Legendary defensive gear", price: 1800, icon: "ðŸ›¡ï¸", power: null, defense: 25, effect: null, bonus: "fire:50%" },
    
    // Legendary items
    { name: "Legendary Crown", type: "badge", rarity: "legendary", description: "The ultimate status symbol", price: 5000, icon: "ðŸ‘‘", power: null, defense: null, effect: null, bonus: null },
    { name: "Excalibur", type: "weapon", rarity: "legendary", description: "The sword of legends", price: 10000, icon: "âš”ï¸", power: 50, defense: null, effect: null, bonus: "holy:100%" },
    { name: "Phoenix Armor", type: "armor", rarity: "legendary", description: "Grants rebirth upon death", price: 8000, icon: "ðŸ”¥", power: null, defense: 40, effect: "revive:1", bonus: null },
  ];

  const createdItems = [];
  for (const itemData of items) {
    const item = await prisma.item.upsert({
      where: { name: itemData.name },
      update: itemData,
      create: itemData,
    });
    createdItems.push(item);
  }

  console.log(\âœ… Created/updated \ shop items\);
  await logAudit("seed:items", \Seeded \ items\, { count: createdItems.length });
  
  return createdItems;
}

async function seedInventories(users: any[], items: any[]) {
  console.log("\nðŸŽ’ Seeding user inventories...");

  let inventoryCount = 0;

  for (const user of users) {
    // Give each user 2-5 random items based on their level
    const itemsToGive = Math.min(user.level, Math.floor(Math.random() * 4) + 2);
    const userItems = [...items].sort(() => 0.5 - Math.random()).slice(0, itemsToGive);
    
    for (const item of userItems) {
      const quantity = item.type === "consumable" ? Math.floor(Math.random() * 5) + 1 : 1;

      try {
        await prisma.inventoryItem.create({
          data: {
            userId: user.id,
            itemId: item.id,
            quantity,
            equipped: false,
          },
        });
        inventoryCount++;
      } catch (e) {
        // Skip if already exists
      }
    }
  }

  console.log(\âœ… Created \ inventory entries\);
  await logAudit("seed:inventories", \Seeded \ inventory items\, { count: inventoryCount });
}

async function seedLeaderboards(users: any[]) {
  console.log("\nðŸ… Seeding leaderboard entries...");

  let entryCount = 0;

  // Create leaderboard entries for all users based on their XP
  for (const user of users) {
    try {
      await prisma.leaderboardEntry.create({
        data: {
          userId: user.id,
          score: user.xp,
          rank: 0, // Will be calculated by rank system
        },
      });
      entryCount++;
    } catch (e) {
      // Skip if already exists
    }
  }

  console.log(\âœ… Created \ leaderboard entries\);
  await logAudit("seed:leaderboards", \Seeded \ leaderboard entries\, { count: entryCount });
}

async function seedReportStats(users: any[], items: any[], achievements: any[]) {
  console.log("\nðŸ“Š Seeding report stats...");

  // Count various entities
  const usersCount = users.length;
  const itemsCount = items.length;
  const achievementsCount = achievements.length;
  const comparisonsCount = 120; // Mock data
  const challengesCount = 45; // Mock data

  await prisma.reportStat.upsert({
    where: { id: 1 },
    update: {
      usersCount,
      itemsCount,
      achievementsCount,
      comparisonsCount,
      challengesCount,
    },
    create: {
      usersCount,
      itemsCount,
      achievementsCount,
      comparisonsCount,
      challengesCount,
    },
  });

  console.log(\âœ… Created report stats (\ users, \ items, \ achievements)\);
  await logAudit("seed:report_stats", "Created report stats", { usersCount, itemsCount, achievementsCount });
}

async function seedMessages(users: any[]) {
  console.log("\nðŸ’¬ Seeding messages...");
  
  if (users.length < 2) {
    console.log("âš ï¸  Need at least 2 users to create messages. Skipping.");
    return;
  }

  const messageTemplates = [
    "Hey! How's it going?",
    "Did you complete the flow today?",
    "Nice work on the leaderboard! ðŸ†",
    "Want to team up for the next challenge?",
    "Thanks for the help earlier!",
  ];

  let messageCount = 0;

  for (let i = 0; i < 30; i++) {
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
    messageCount++;
  }

  console.log(\âœ… Created \ messages\);
  await logAudit("seed:messages", \Seeded \ messages\, { count: messageCount });
}

async function seedQuestions() {
  console.log("\nâ“ Seeding flow questions...");

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
      text: "How often do you exercise per week?",
      locale: "en",
      options: [
        { label: "Never", value: "0", order: 0 },
        { label: "1-2 times", value: "1-2", order: 1 },
        { label: "3-4 times", value: "3-4", order: 2 },
        { label: "5+ times", value: "5+", order: 3 },
      ]
    },
    {
      text: "What motivates you the most?",
      locale: "en",
      options: [
        { label: "Achievement", value: "achievement", order: 0 },
        { label: "Recognition", value: "recognition", order: 1 },
        { label: "Learning", value: "learning", order: 2 },
        { label: "Impact", value: "impact", order: 3 },
      ]
    },
    {
      text: "How do you handle feedback?",
      locale: "en",
      options: [
        { label: "Embrace it", value: "embrace", order: 0 },
        { label: "Analyze it", value: "analyze", order: 1 },
        { label: "Reflect on it", value: "reflect", order: 2 },
        { label: "Act on it", value: "act", order: 3 },
      ]
    },
  ];

  let questionCount = 0;
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
      questionCount++;
    }
  }

  console.log(\âœ… Created \ new flow questions\);
  await logAudit("seed:questions", \Seeded \ questions\, { count: questionCount });
}

async function seedGroups(users: any[]) {
  console.log("\nðŸ‘¥ Seeding groups/totems...");

  const groups = [
    { name: "The Phoenix Alliance", emblem: "ðŸ”¥", motto: "Rising from the ashes" },
    { name: "Lightning Squad", emblem: "âš¡", motto: "Fast and fierce" },
    { name: "Ocean Warriors", emblem: "ðŸŒŠ", motto: "Ride the wave" },
    { name: "Moonlight Guild", emblem: "ðŸŒ™", motto: "Night brings power" },
    { name: "Star Seekers", emblem: "â­", motto: "Reach for the stars" },
  ];

  let groupCount = 0;

  for (let i = 0; i < groups.length && i < users.length; i++) {
    const groupData = groups[i];
    const owner = users[i];

    const group = await prisma.group.create({
      data: {
        name: groupData.name,
        emblem: groupData.emblem,
        motto: groupData.motto,
        ownerId: owner.id,
        totalXp: 0,
      },
    });

    await prisma.groupMember.create({
      data: {
        userId: owner.id,
        groupId: group.id,
        role: "owner",
      },
    });

    // Add 2-4 additional members
    const availableUsers = users.filter(u => u.id !== owner.id);
    const membersToAdd = availableUsers.slice(0, Math.min(4, availableUsers.length));

    for (const member of membersToAdd) {
      await prisma.groupMember.create({
        data: {
          userId: member.id,
          groupId: group.id,
          role: "member",
        },
      });
    }

    groupCount++;
  }

  console.log(\âœ… Created \ groups\);
  await logAudit("seed:groups", \Seeded \ groups\, { count: groupCount });
}

// ============================================================================
// MAIN SEEDER
// ============================================================================

async function main() {
  console.log("â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
  console.log("â•‘          ðŸŒ± SEEDER v0.35.8 - Starting...              â•‘");
  console.log("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");

  const startTime = Date.now();

  try {
    // Seed in dependency order
    const users = await seedUsers();
    const achievements = await seedAchievements();
    await seedUserAchievements(users, achievements);
    const items = await seedItems();
    await seedInventories(users, items);
    await seedLeaderboards(users);
    await seedReportStats(users, items, achievements);
    await seedMessages(users);
    await seedQuestions();
    await seedGroups(users);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
    console.log("â•‘          âœ… SEEDER v0.35.8 COMPLETE!                   â•‘");
    console.log(\â•‘          Duration: \s                           â•‘\);
    console.log("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n");

    console.log("ðŸŒ± Database seeded with demo world:");
    console.log(\   - \ users (varied stats for leaderboards)\);
    console.log(\   - \ achievements (with user unlocks)\);
    console.log(\   - \ shop items (common to legendary)\);
    console.log("   - Leaderboard entries (all users ranked)");
    console.log("   - Report stats (dashboard ready)");
    console.log("   - Inventory items (users have gear)");
    console.log("   - Messages (cross-user communication)");
    console.log("   - Questions (flow system ready)");
    console.log("   - Groups/totems (social system active)\n");

    await logAudit("seed:complete", \Seeder v0.35.8 completed successfully\, { 
      duration: \\s\,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("\nâŒ Seeder failed:", error);
    await logAudit("seed:error", \Seeder v0.35.8 failed\, { 
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
    await prisma.();
  });
