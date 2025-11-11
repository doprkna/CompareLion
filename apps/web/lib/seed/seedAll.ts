/**
 * Master Seed Function
 * v0.35.14a - Fixed item seeding with proper field names
 */

import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { UserRole, QuestionType } from '@parel/db/client';
import { seedAchievements } from '@/lib/seed-achievements';

export interface SeedStats {
  users: number;
  achievements: number;
  items: number;
  questions: number;
  messages: number;
  notifications: number;
  events: number;
  leaderboard: number;
  duration: string;
}

export interface SeedResult {
  success: boolean;
  stats: SeedStats;
  errors: string[];
}

/**
 * Seed users with demo accounts
 */
async function seedUsers(tx: any = prisma): Promise<number> {
  console.log('👥 Seeding users...');
  
  const demoPasswordHash = await hash('password123', 10);
  
  const userTemplates = [
    { name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, xp: 15000, funds: 5000, level: 15, karma: 100, prestige: 95 },
    { name: 'Demo Player', email: 'demo@example.com', role: UserRole.USER, xp: 8500, funds: 2100, level: 10, karma: 75, prestige: 68 },
    { name: 'Alice Wonder', email: 'alice@example.com', role: UserRole.USER, xp: 12000, funds: 3200, level: 13, karma: 88, prestige: 82 },
    { name: 'Bob Builder', email: 'bob@example.com', role: UserRole.USER, xp: 4200, funds: 950, level: 6, karma: 45, prestige: 52 },
    { name: 'Charlie Fox', email: 'charlie@example.com', role: UserRole.USER, xp: 9800, funds: 2600, level: 11, karma: 72, prestige: 75 },
    { name: 'Diana Storm', email: 'diana@example.com', role: UserRole.USER, xp: 6700, funds: 1600, level: 8, karma: 58, prestige: 64 },
    { name: 'Eva Moon', email: 'eva@example.com', role: UserRole.USER, xp: 11200, funds: 2900, level: 12, karma: 80, prestige: 78 },
    { name: 'Frank Ocean', email: 'frank@example.com', role: UserRole.USER, xp: 3500, funds: 720, level: 5, karma: 32, prestige: 42 },
    { name: 'Grace Flow', email: 'grace@example.com', role: UserRole.USER, xp: 7900, funds: 1850, level: 9, karma: 65, prestige: 70 },
    { name: 'Henry Knight', email: 'henry@example.com', role: UserRole.USER, xp: 5400, funds: 1250, level: 7, karma: 48, prestige: 58 },
    { name: 'Iris Star', email: 'iris@example.com', role: UserRole.USER, xp: 10500, funds: 2750, level: 11, karma: 77, prestige: 73 },
    { name: 'Jack Thunder', email: 'jack@example.com', role: UserRole.USER, xp: 2800, funds: 580, level: 4, karma: 28, prestige: 38 },
    { name: 'Kate Blaze', email: 'kate@example.com', role: UserRole.USER, xp: 8800, funds: 2300, level: 10, karma: 70, prestige: 72 },
    { name: 'Leo Bright', email: 'leo@example.com', role: UserRole.USER, xp: 6200, funds: 1480, level: 8, karma: 54, prestige: 62 },
    { name: 'Maya Phoenix', email: 'maya@example.com', role: UserRole.USER, xp: 13500, funds: 3650, level: 14, karma: 92, prestige: 88 },
    { name: 'Noah Zen', email: 'noah@example.com', role: UserRole.USER, xp: 4800, funds: 1050, level: 6, karma: 42, prestige: 50 },
    { name: 'Olivia Dawn', email: 'olivia@example.com', role: UserRole.USER, xp: 9200, funds: 2450, level: 10, karma: 68, prestige: 71 },
    { name: 'Peter Sage', email: 'peter@example.com', role: UserRole.USER, xp: 5900, funds: 1380, level: 7, karma: 51, prestige: 60 },
    { name: 'Quinn Shadow', email: 'quinn@example.com', role: UserRole.USER, xp: 7400, funds: 1750, level: 9, karma: 62, prestige: 67 },
    { name: 'Ruby Flame', email: 'ruby@example.com', role: UserRole.USER, xp: 10800, funds: 2850, level: 12, karma: 78, prestige: 76 },
  ];

  for (const template of userTemplates) {
    await tx.user.upsert({
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

  const count = await tx.user.count();
  console.log(`   ✅  users created/updated`);
  return count;
}

/**
 * Seed shop items with proper field names
 */
async function seedItems(tx: any = prisma): Promise<number> {
  console.log('📦 Seeding shop items...');
  
  const items = [
    { key: 'bronze-badge', name: 'Bronze Badge', type: 'badge', rarity: 'common', description: 'A basic bronze badge', goldPrice: 100, emoji: '🥉', isShopItem: true },
    { key: 'silver-badge', name: 'Silver Badge', type: 'badge', rarity: 'uncommon', description: 'A shiny silver badge', goldPrice: 300, emoji: '🥈', isShopItem: true },
    { key: 'golden-badge', name: 'Golden Badge', type: 'badge', rarity: 'rare', description: 'A prestigious golden badge', goldPrice: 800, emoji: '🥇', isShopItem: true },
    { key: 'legendary-crown', name: 'Legendary Crown', type: 'badge', rarity: 'legendary', description: 'The ultimate status symbol', goldPrice: 2000, emoji: '👑', isShopItem: true },
    { key: 'xp-booster', name: 'XP Booster', type: 'consumable', rarity: 'uncommon', description: 'Doubles XP gain for 1 hour', goldPrice: 500, emoji: '⚡', isShopItem: true },
    { key: 'coin-pack', name: 'Coin Pack', type: 'consumable', rarity: 'common', description: 'Instant 500 gold', goldPrice: 250, emoji: '💰', isShopItem: true },
    { key: 'crystal-aura', name: 'Crystal Aura', type: 'accessory', rarity: 'rare', description: 'Glowing crystal effect', goldPrice: 1200, emoji: '💎', isShopItem: true },
    { key: 'dragon-emblem', name: 'Dragon Emblem', type: 'badge', rarity: 'legendary', description: 'Mark of a dragon slayer', goldPrice: 3500, emoji: '🐉', isShopItem: true },
  ];

  for (const itemData of items) {
    await tx.item.upsert({
      where: { key: itemData.key },
      update: {
        name: itemData.name,
        type: itemData.type,
        rarity: itemData.rarity,
        description: itemData.description,
        goldPrice: itemData.goldPrice,
        emoji: itemData.emoji,
        icon: itemData.emoji, // Also set icon field
        isShopItem: itemData.isShopItem,
      },
      create: {
        key: itemData.key,
        name: itemData.name,
        type: itemData.type,
        rarity: itemData.rarity,
        description: itemData.description,
        goldPrice: itemData.goldPrice,
        emoji: itemData.emoji,
        icon: itemData.emoji, // Also set icon field
        isShopItem: itemData.isShopItem,
      },
    });
  }

  const count = await tx.item.count({ where: { isShopItem: true } });
  console.log(`   ✅  shop items created/updated`);
  return count;
}

/**
 * Seed flow questions with options
 */
async function seedQuestions(tx: any = prisma): Promise<number> {
  console.log('❓ Seeding flow questions...');
  
  // Create category hierarchy
  let category = await tx.category.findFirst({ where: { name: 'Personal Growth' } });
  if (!category) {
    category = await tx.category.create({ data: { name: 'Personal Growth' } });
  }

  let subCategory = await tx.subCategory.findFirst({ 
    where: { name: 'Habits & Lifestyle', categoryId: category.id } 
  });
  if (!subCategory) {
    subCategory = await tx.subCategory.create({ 
      data: { name: 'Habits & Lifestyle', categoryId: category.id } 
    });
  }

  let subSubCategory = await tx.subSubCategory.findFirst({ 
    where: { name: 'Daily Routines', subCategoryId: subCategory.id } 
  });
  if (!subSubCategory) {
    subSubCategory = await tx.subSubCategory.create({ 
      data: { name: 'Daily Routines', subCategoryId: subCategory.id } 
    });
  }

  let leaf = await tx.sssCategory.findFirst({ 
    where: { name: 'Self-Assessment', subSubCategoryId: subSubCategory.id } 
  });
  if (!leaf) {
    leaf = await tx.sssCategory.create({ 
      data: { name: 'Self-Assessment', subSubCategoryId: subSubCategory.id } 
    });
  }

  const questionTemplates = [
    { text: 'How often do you exercise per week?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Never', value: '0', order: 0 },
      { label: '1-2 times', value: '1-2', order: 1 },
      { label: '3-4 times', value: '3-4', order: 2 },
      { label: '5+ times', value: '5+', order: 3 },
    ]},
    { text: 'What motivates you the most?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Achievement', value: 'achievement', order: 0 },
      { label: 'Recognition', value: 'recognition', order: 1 },
      { label: 'Learning', value: 'learning', order: 2 },
      { label: 'Impact', value: 'impact', order: 3 },
    ]},
    { text: 'Select all work styles that fit you', type: QuestionType.MULTIPLE_CHOICE, options: [
      { label: 'Solo focus', value: 'solo', order: 0 },
      { label: 'Team collaboration', value: 'team', order: 1 },
      { label: 'Flexible approach', value: 'flexible', order: 2 },
      { label: 'Structured planning', value: 'structured', order: 3 },
    ]},
    { text: 'How do you handle feedback?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Embrace it', value: 'embrace', order: 0 },
      { label: 'Analyze it', value: 'analyze', order: 1 },
      { label: 'Reflect on it', value: 'reflect', order: 2 },
      { label: 'Act on it', value: 'act', order: 3 },
    ]},
    { text: 'How many hours do you sleep on average?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Less than 6', value: '<6', order: 0 },
      { label: '6-7 hours', value: '6-7', order: 1 },
      { label: '7-8 hours', value: '7-8', order: 2 },
      { label: '8+ hours', value: '8+', order: 3 },
    ]},
    { text: 'Select all stress management techniques you use', type: QuestionType.MULTIPLE_CHOICE, options: [
      { label: 'Exercise', value: 'exercise', order: 0 },
      { label: 'Meditation', value: 'meditation', order: 1 },
      { label: 'Talk to friends', value: 'social', order: 2 },
      { label: 'Take breaks', value: 'breaks', order: 3 },
    ]},
    { text: 'What is your ideal learning method?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Reading books', value: 'reading', order: 0 },
      { label: 'Video tutorials', value: 'video', order: 1 },
      { label: 'Hands-on practice', value: 'practice', order: 2 },
      { label: 'Group discussions', value: 'group', order: 3 },
    ]},
    { text: 'What is your primary goal this year?', type: QuestionType.TEXT, options: [] },
    { text: 'Rate your satisfaction level (1-10)', type: QuestionType.NUMERIC, options: [] },
    { text: 'How do you approach new challenges?', type: QuestionType.SINGLE_CHOICE, options: [
      { label: 'Jump right in', value: 'action', order: 0 },
      { label: 'Research first', value: 'research', order: 1 },
      { label: 'Seek advice', value: 'advice', order: 2 },
      { label: 'Plan carefully', value: 'plan', order: 3 },
    ]},
  ];

  for (const q of questionTemplates) {
    const existing = await tx.flowQuestion.findFirst({
      where: { text: q.text, locale: 'en' }
    });

    if (!existing) {
      await tx.flowQuestion.create({
        data: {
          text: q.text,
          locale: 'en',
          categoryId: leaf.id,
          type: q.type,
          isActive: true,
          options: q.options.length > 0 ? {
            create: q.options,
          } : undefined,
        },
      });
    }
  }

  const count = await tx.flowQuestion.count();
  console.log(`   ✅  questions in database`);
  return count;
}

/**
 * Seed messages between users
 */
async function seedMessages(tx: any = prisma): Promise<number> {
  console.log('💬 Seeding messages...');
  
  const allUsers = await tx.user.findMany();
  const messageTemplates = [
    'Hey! How is it going?',
    'Nice work on the leaderboard! 🏆',
    'Want to team up for the next challenge?',
    'Thanks for the help earlier!',
    'Just unlocked a new badge! 🎉',
    'The shop has some amazing items today',
    'See you at the top!',
    'Good luck with your goals!',
    'Let us connect and share strategies',
    'Did you complete the flow today?',
  ];

  if (allUsers.length >= 2) {
    for (let i = 0; i < 10; i++) {
      const sender = allUsers[i % allUsers.length];
      const receiver = allUsers[(i + 5) % allUsers.length];
      
      if (sender.id !== receiver.id) {
        try {
          await tx.message.create({
            data: {
              senderId: sender.id,
              receiverId: receiver.id,
              content: messageTemplates[i],
              isRead: Math.random() > 0.5,
              createdAt: new Date(Date.now() - (i * 3600000)),
            },
          });
        } catch (e) {
          // Skip if duplicate
        }
      }
    }
  }

  const count = await tx.message.count();
  console.log(`   ✅  messages created`);
  return count;
}

/**
 * Seed notifications
 */
async function seedNotifications(tx: any = prisma): Promise<number> {
  console.log('🔔 Seeding notifications...');
  
  const allUsers = await tx.user.findMany();
  const notifTemplates = [
    { title: 'Welcome to PareL!', content: 'Your adventure starts today. Complete your profile to get started!' },
    { title: 'Shop Update', content: 'New legendary items available! Check out the Dragon Emblem.' },
    { title: 'Event Incoming', content: 'Prepare for Winter Season Challenge! Starts soon.' },
    { title: 'Survey', content: 'Vote on new feature ideas. Your feedback shapes PareL!' },
    { title: 'Maintenance', content: 'System maintenance scheduled tonight. Expect 30min downtime.' },
  ];

  for (const notif of notifTemplates) {
    for (let i = 0; i < Math.min(5, allUsers.length); i++) {
      try {
        await tx.notification.create({
          data: {
            userId: allUsers[i].id,
            type: 'system',
            title: notif.title,
            body: notif.content,
            isRead: Math.random() > 0.7,
            createdAt: new Date(Date.now() - (i * 86400000)),
          },
        });
      } catch (e) {
        // Skip if duplicate
      }
    }
  }

  const count = await tx.notification.count();
  console.log(`   ✅  notifications created`);
  return count;
}

/**
 * Seed world events
 */
async function seedEvents(tx: any = prisma): Promise<number> {
  console.log('🌍 Seeding world events...');
  
  await tx.globalEvent.upsert({
    where: { id: 1 },
    update: {
      title: 'Winter Festival',
      description: 'Limited-time challenges and rewards! Complete daily quests for exclusive items.',
      emoji: '❄️',
      type: 'seasonal',
      bonusType: 'percentage',
      bonusValue: 25,
      targetScope: 'all',
      startAt: new Date(Date.now() - 86400000),
      endAt: new Date(Date.now() + (7 * 86400000)),
      active: true,
    },
    create: {
      title: 'Winter Festival',
      description: 'Limited-time challenges and rewards! Complete daily quests for exclusive items.',
      emoji: '❄️',
      type: 'seasonal',
      bonusType: 'percentage',
      bonusValue: 25,
      targetScope: 'all',
      startAt: new Date(Date.now() - 86400000),
      endAt: new Date(Date.now() + (7 * 86400000)),
      active: true,
    },
  });

  const count = await tx.globalEvent.count({ where: { active: true } });
  console.log(`   ✅  active event(s) created`);
  return count;
}

/**
 * Seed leaderboard entries
 */
async function seedLeaderboard(tx: any = prisma): Promise<number> {
  console.log('🏅 Seeding leaderboard...');
  
  const allUsers = await tx.user.findMany();
  for (const user of allUsers) {
    try {
      await tx.leaderboardEntry.create({
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

  const count = await tx.leaderboardEntry.count();
  console.log(`   ✅  leaderboard entries created`);
  return count;
}

/**
 * Master seed function - seeds all modules
 */
export async function seedAll(): Promise<SeedResult> {
  console.log('\\n🌱 Starting comprehensive database seed...\\n');
  
  const startTime = performance.now();
  const stats: SeedStats = {
    users: 0,
    achievements: 0,
    items: 0,
    questions: 0,
    messages: 0,
    notifications: 0,
    events: 0,
    leaderboard: 0,
    duration: '0s',
  };
  const errors: string[] = [];

  // Seed users first (required for other seeders)
  try {
    stats.users = await seedUsers();
  } catch (err) {
    errors.push(`Users: `);
  }

  // Seed achievements
  try {
    console.log('🏆 Seeding achievements...');
    await seedAchievements();
    stats.achievements = await prisma.achievement.count();
    console.log(`   ✅  achievements created/updated`);
  } catch (err) {
    errors.push(`Achievements: `);
  }

  // Seed items
  try {
    stats.items = await seedItems();
  } catch (err) {
    errors.push(`Items: `);
  }

  // Seed questions
  try {
    stats.questions = await seedQuestions();
  } catch (err) {
    errors.push(`Questions: `);
  }

  // Seed messages
  try {
    stats.messages = await seedMessages();
  } catch (err) {
    errors.push(`Messages: `);
  }

  // Seed notifications
  try {
    stats.notifications = await seedNotifications();
  } catch (err) {
    errors.push(`Notifications: `);
  }

  // Seed events
  try {
    stats.events = await seedEvents();
  } catch (err) {
    errors.push(`Events: `);
  }

  // Seed leaderboard
  try {
    stats.leaderboard = await seedLeaderboard();
  } catch (err) {
    errors.push(`Leaderboard: `);
  }

  const endTime = performance.now();
  stats.duration = `s`;

  console.log(`\\n✅ Seed complete! Duration: `);
  console.log('📊 Final Stats:', stats);
  
  if (errors.length > 0) {
    console.warn('⚠️ Some operations failed:', errors);
  }

  return {
    success: errors.length === 0,
    stats,
    errors,
  };
}


