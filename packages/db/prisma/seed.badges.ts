import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBadges() {
  console.log('🌱 Seeding badges...');

  const badges = [
    {
      slug: 'first-purchase',
      title: 'First Purchase',
      description: 'Made your first purchase in the shop',
      icon: '🛒',
    },
    {
      slug: 'big-spender',
      title: 'Big Spender',
      description: 'Spent over 1000 funds in total',
      icon: '💎',
    },
    {
      slug: 'subscriber',
      title: 'Subscriber',
      description: 'Active subscription holder',
      icon: '⭐',
    },
  ];

  for (const badgeData of badges) {
    await prisma.badge.upsert({
      where: { slug: badgeData.slug },
      update: badgeData,
      create: badgeData,
    });
  }

  console.log(`✅ Seeded ${badges.length} badges`);
}

if (require.main === module) {
  seedBadges()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
