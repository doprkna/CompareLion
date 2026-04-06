/**
 * Idempotent DEV-only seed: Flow categories + questions.
 * Run only when SEED_DEV === "true" OR NODE_ENV !== "production".
 * No schema changes, no migrations, no production seeding.
 */

import { PrismaClient } from '@parel/db/client';

const prisma = new PrismaClient();

const ROOT_ID = 'seed-flow-dev-root';
const SUB_ID = 'seed-flow-dev-sub';
const SUBSUB_ID = 'seed-flow-dev-subsub';

const CAT_IDS = ['seed-flow-dev-cat-1', 'seed-flow-dev-cat-2', 'seed-flow-dev-cat-3'] as const;
const CAT_NAMES: Record<(typeof CAT_IDS)[number], string> = {
  'seed-flow-dev-cat-1': 'Wellbeing',
  'seed-flow-dev-cat-2': 'Goals',
  'seed-flow-dev-cat-3': 'Habits',
};

const LOCALE = 'en';
const QUESTIONS_PER_CATEGORY = 30;

function questionId(catIndex: number, qIndex: number): string {
  return `seed-flow-dev-q-` + (catIndex + 1) + `-` + String(qIndex + 1).padStart(2, '0');
}

function optionId(catIndex: number, qIndex: number, optIndex: number): string {
  return `seed-flow-dev-opt-` + (catIndex + 1) + `-` + String(qIndex + 1).padStart(2, '0') + `-` + (optIndex + 1);
}

async function ensureHierarchy(): Promise<void> {
  await prisma.category.upsert({
    where: { id: ROOT_ID },
    create: { id: ROOT_ID, name: 'Flow Dev Root' },
    update: {},
  });
  await prisma.subCategory.upsert({
    where: { id: SUB_ID },
    create: { id: SUB_ID, name: 'Flow Dev Sub', categoryId: ROOT_ID },
    update: {},
  });
  await prisma.subSubCategory.upsert({
    where: { id: SUBSUB_ID },
    create: { id: SUBSUB_ID, name: 'Flow Dev SubSub', subCategoryId: SUB_ID },
    update: {},
  });
}

async function seedCategories(): Promise<void> {
  for (let i = 0; i < CAT_IDS.length; i++) {
    const id = CAT_IDS[i];
    await prisma.sssCategory.upsert({
      where: { id },
      create: {
        id,
        name: CAT_NAMES[id],
        subSubCategoryId: SUBSUB_ID,
        status: 'active',
      },
      update: { name: CAT_NAMES[id], status: 'active' },
    });
  }
}

async function seedQuestions(): Promise<void> {
  for (let c = 0; c < CAT_IDS.length; c++) {
    const categoryId = CAT_IDS[c];
    for (let q = 0; q < QUESTIONS_PER_CATEGORY; q++) {
      const qId = questionId(c, q);
      await prisma.flowQuestion.upsert({
        where: { id: qId },
        create: {
          id: qId,
          categoryId,
          locale: LOCALE,
          text: `Dev question ` + (c + 1) + `.` + (q + 1) + `: What matters most to you here?`,
          type: 'SINGLE_CHOICE',
          isActive: true,
        },
        update: {
          locale: LOCALE,
          text: `Dev question ` + (c + 1) + `.` + (q + 1) + `: What matters most to you here?`,
          type: 'SINGLE_CHOICE',
          isActive: true,
        },
      });
      for (let o = 0; o < 2; o++) {
        await prisma.flowQuestionOption.upsert({
          where: { id: optionId(c, q, o) },
          create: {
            id: optionId(c, q, o),
            questionId: qId,
            label: o === 0 ? 'Option A' : 'Option B',
            value: `opt-` + o,
            order: o,
          },
          update: {
            questionId: qId,
            label: o === 0 ? 'Option A' : 'Option B',
            value: `opt-` + o,
            order: o,
          },
        });
      }
    }
  }
}

async function main(): Promise<void> {
  const allow =
    process.env.SEED_DEV === 'true' || (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod');
  if (!allow) {
    console.log('seed-flow-dev: skipped (SEED_DEV not set and NODE_ENV is production)');
    process.exit(0);
    return;
  }

  await ensureHierarchy();
  await seedCategories();
  await seedQuestions();
  console.log('seed-flow-dev: 3 categories, 90 questions');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
