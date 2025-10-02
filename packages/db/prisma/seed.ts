import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
// import { seedShop } from './seed.shop';
// import { seedBadges } from './seed.badges';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed users
  const users = [
    "demo@example.com",
    ...Array.from({ length: 9 }).map((_, i) => `user${i + 1}@example.com`)
  ];
  for (const email of users) {
    const passwordHash = await hash("password123", 10);
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, theme: "light" }
    });
  }
  console.log(`Seeded ${users.length} users`);

  // 2. Seed demo category tree
  const category = await prisma.category.create({
    data: { name: "Demo Category" }
  });
  const subCategory = await prisma.subCategory.create({
    data: { name: "Demo SubCategory", categoryId: category.id }
  });
  const subSubCategory = await prisma.subSubCategory.create({
    data: { name: "Demo SubSub", subCategoryId: subCategory.id }
  });
  const leaf = await prisma.sssCategory.create({
    data: { name: "Demo Leaf", subSubCategoryId: subSubCategory.id }
  });
  console.log("Created Demo Category tree");

  // 3. Seed demo questions
  await prisma.question.createMany({
    data: [
      { text: "What is 2 + 2?", difficulty: "easy", categoryId: category.id, ssscId: leaf.id },
      { text: "What is the capital of France?", difficulty: "easy", categoryId: category.id, ssscId: leaf.id },
      { text: "Explain the difference between HTTP and HTTPS.", difficulty: "medium", categoryId: category.id, ssscId: leaf.id }
    ],
    skipDuplicates: true
  });
  console.log("Inserted 3 demo questions");

  // 4. Seed shop products
  // await seedShop();

  // 5. Seed badges
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
