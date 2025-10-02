import { prisma } from './client';
import { hash } from 'bcryptjs';

async function main() {
  // 1. Demo user
  const email = 'demo@example.com';
  const password = 'password123';
  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, theme: 'light' },
  });
  console.log(`Demo user ready: ${email} / ${password}`);

  // 2. Demo category tree
  const category = await prisma.category.upsert({
    where: { name: 'Demo Category' },
    update: {},
    create: { name: 'Demo Category' },
  });

  const subCategory = await prisma.subCategory.upsert({
    where: { name: 'Demo SubCategory' },
    update: {},
    create: { name: 'Demo SubCategory', categoryId: category.id },
  });

  const subSubCategory = await prisma.subSubCategory.upsert({
    where: { name: 'Demo SubSub' },
    update: {},
    create: { name: 'Demo SubSub', subCategoryId: subCategory.id },
  });

  const sssc = await prisma.sssCategory.upsert({
    where: { name: 'Demo Leaf' },
    update: {},
    create: { name: 'Demo Leaf', subSubCategoryId: subSubCategory.id },
  });

  // 3. Demo questions
  await prisma.question.createMany({
    data: [
      { text: 'What is 2 + 2?', ssscId: sssc.id, difficulty: 'easy' },
      { text: 'Name the capital of France.', ssscId: sssc.id, difficulty: 'easy' },
      { text: 'Explain the difference between HTTP and HTTPS.', ssscId: sssc.id, difficulty: 'medium' },
    ],
    skipDuplicates: true,
  });

  console.log('Demo questions inserted under Demo Leaf');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
