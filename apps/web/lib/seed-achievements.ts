/**
 * Achievement Seeding Script
 * Creates base achievements in the database
 * v0.26.0 - Achievements Awakened
 * 
 * Run: npx tsx apps/web/lib/seed-achievements.ts
 */

import { prisma } from './db';

const ACHIEVEMENTS = [
  // COMBAT
  { key: 'first-blood', category: 'combat', tier: 1, title: 'First Blood', name: 'First Kill', description: 'Defeat your first shadow enemy', emoji: '⚔️', xpReward: 50, rewardGold: 10 },
  { key: 'combat-veteran', category: 'combat', tier: 1, title: 'Veteran', name: '10 Kills', description: 'Defeat 10 shadow enemies', emoji: '🗡️', xpReward: 100, rewardGold: 25, code: 'combat-veteran-1' },
  { key: 'combat-veteran', category: 'combat', tier: 2, title: 'Elite Warrior', name: '50 Kills', description: 'Defeat 50 shadow enemies', emoji: '⚔️', xpReward: 250, rewardGold: 75, code: 'combat-veteran-2' },
  { key: 'combat-veteran', category: 'combat', tier: 3, title: 'Shadow Slayer', name: '100 Kills', description: 'Defeat 100 shadow enemies', emoji: '🗡️', xpReward: 500, rewardGold: 150, code: 'combat-veteran-3' },
  { key: 'boss-breaker', category: 'combat', tier: 1, title: 'Boss Breaker', name: 'Boss Defeated', description: 'Defeat your first boss enemy', emoji: '👑', xpReward: 200, rewardGold: 100 },
  { key: 'unstoppable', category: 'combat', tier: 1, title: 'Unstoppable', name: '10 Streak', description: 'Achieve a 10 kill streak', emoji: '🔥', xpReward: 150, rewardGold: 50, code: 'unstoppable-1' },
  { key: 'unstoppable', category: 'combat', tier: 2, title: 'Relentless', name: '25 Streak', description: 'Achieve a 25 kill streak', emoji: '🔥', xpReward: 400, rewardGold: 125, code: 'unstoppable-2' },
  { key: 'unstoppable', category: 'combat', tier: 3, title: 'Invincible', name: '50 Streak', description: 'Achieve a 50 kill streak', emoji: '🔥', xpReward: 750, rewardGold: 250, code: 'unstoppable-3' },
  
  // MIND / REFLECTION
  { key: 'reflective-mind', category: 'mind', tier: 1, title: 'Reflective Mind', name: '10 Reflections', description: 'Complete 10 reflection sessions', emoji: '🧠', xpReward: 100, rewardGold: 25, code: 'reflective-mind-1' },
  { key: 'reflective-mind', category: 'mind', tier: 2, title: 'Deep Thinker', name: '50 Reflections', description: 'Complete 50 reflection sessions', emoji: '🧠', xpReward: 300, rewardGold: 75, code: 'reflective-mind-2' },
  { key: 'reflective-mind', category: 'mind', tier: 3, title: 'Master Philosopher', name: '100 Reflections', description: 'Complete 100 reflection sessions', emoji: '🧠', xpReward: 600, rewardGold: 150, code: 'reflective-mind-3' },
  { key: 'deep-thinker', category: 'mind', tier: 1, title: 'Deep Thinker', name: 'Reflection Master', description: 'Spend 30 minutes reflecting', emoji: '💭', xpReward: 150, rewardGold: 40 },
  
  // SOCIAL
  { key: 'social-first-post', category: 'social', tier: 1, title: 'Voice Heard', name: 'First Post', description: 'Share your first reflection or thought', emoji: '💬', xpReward: 75, rewardGold: 20 },
  { key: 'social-first-comment', category: 'social', tier: 1, title: 'Engaged', name: 'First Comment', description: 'Comment on someone\'s post', emoji: '💭', xpReward: 50, rewardGold: 10 },
  { key: 'social-10-replies', category: 'social', tier: 1, title: 'Conversationalist', name: '10 Replies', description: 'Reply to 10 posts or comments', emoji: '💬', xpReward: 150, rewardGold: 40 },
  
  // COMMERCE
  { key: 'first-purchase', category: 'commerce', tier: 1, title: 'First Purchase', name: 'First Buy', description: 'Make your first shop purchase', emoji: '🛒', xpReward: 100, rewardGold: 25 },
  { key: 'commerce-5-purchases', category: 'commerce', tier: 1, title: 'Regular Customer', name: '5 Purchases', description: 'Make 5 shop purchases', emoji: '💰', xpReward: 200, rewardGold: 50 },
  { key: 'first-sale', category: 'commerce', tier: 1, title: 'Entrepreneur', name: 'First Sale', description: 'Make your first marketplace sale', emoji: '💵', xpReward: 150, rewardGold: 40 },
  
  // INTEGRATION
  { key: 'connected-facebook', category: 'integration', tier: 1, title: 'Facebook Connected', name: 'Meta Link', description: 'Connect your Facebook account', emoji: '📘', xpReward: 75, rewardGold: 20 },
  { key: 'linked-linkedin', category: 'integration', tier: 1, title: 'LinkedIn Linked', name: 'LinkedIn Connect', description: 'Connect your LinkedIn account', emoji: '💼', xpReward: 75, rewardGold: 20 },
  { key: 'synced-tiktok', category: 'integration', tier: 1, title: 'TikTok Synced', name: 'TikTok Link', description: 'Connect your TikTok account', emoji: '🎵', xpReward: 75, rewardGold: 20 },
  
  // PROFILE
  { key: 'profile-complete', category: 'integration', tier: 1, title: 'Profile Complete', name: 'All Set', description: 'Complete all profile fields (bio, photo, social links)', emoji: '👤', xpReward: 100, rewardGold: 30 },
];

export async function seedAchievements() {
  console.log('🌱 Seeding achievements...');

  for (const ach of ACHIEVEMENTS) {
    try {
      // Check if exists by key (if provided) or code
      const existing = ach.key
        ? await prisma.achievement.findFirst({
            where: {
              OR: [
                { key: ach.key, tier: ach.tier },
                { code: ach.code || ach.key },
              ],
            },
          })
        : await prisma.achievement.findUnique({
            where: { code: ach.code! },
          });

      if (existing) {
        console.log(`⏭️  Skipping ${ach.key || ach.code} (already exists)`);
        continue;
      }

      await prisma.achievement.create({
        data: {
          key: ach.key || null,
          code: ach.code || ach.key || `achievement-${Date.now()}`,
          category: ach.category,
          tier: ach.tier,
          title: ach.title,
          name: ach.name || null,
          description: ach.description,
          emoji: ach.emoji || null,
          icon: ach.emoji || null,
          xpReward: ach.xpReward,
          rewardGold: ach.rewardGold || 0,
        },
      });

      console.log(`✅ Created: ${ach.title} (${ach.category}, tier ${ach.tier})`);
    } catch (error) {
      console.error(`❌ Error creating ${ach.key || ach.code}:`, error);
    }
  }

  console.log('✨ Achievement seeding complete!');
}

