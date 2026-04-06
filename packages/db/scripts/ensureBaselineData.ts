/**
 * ensureBaselineData.ts - Alpha baseline seed contract.
 * Idempotent; enforces only minimal invariants. See docs/seed-baseline.md.
 */

import type { PrismaClient } from '@parel/db/client';
import { UserRole, QuestionType } from '@parel/db/client';
import { hash } from 'bcryptjs';
import { loadQuestionsFromPack, resolvePackPath } from '../content/loader';

const ADMIN_EMAIL = 'admin@example.com';
const BASELINE_ROOT = 'baseline-root';
const BASELINE_SUB = 'baseline-sub';
const BASELINE_SUBSUB = 'baseline-subsub';
const BASELINE_SSS = 'baseline-sss';
const BASELINE_Q = 'baseline-q-01';

export async function ensureBaselineData(
  prisma: PrismaClient
): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];

  // 1) Admin user
  const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
  if (adminCount === 0) {
    const pw = await hash(process.env.ADMIN_PASSWORD ?? '1AmTheArchitect', 10);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash: pw,
        name: 'Admin User',
        role: UserRole.ADMIN,
        birthYear: 1990,
      },
    });
    created.push('User(admin)');
  } else {
    skipped.push('User(admin)');
  }

  // 2) RPG enemies (3 common + 1 boss)
  const enemyCount = await prisma.enemy.count();
  if (enemyCount === 0) {
    const enemies = [
      { name: 'Tiny Slime', level: 1, power: 3, defense: 0, maxHp: 15, rarity: 'common', lootTable: {} as object },
      { name: 'Angry Goblin', level: 1, power: 5, defense: 2, maxHp: 25, rarity: 'common', lootTable: {} as object },
      { name: 'Scruffy Wolf', level: 2, power: 8, defense: 3, maxHp: 35, rarity: 'common', lootTable: {} as object },
      { name: 'Boss Placeholder', level: 3, power: 15, defense: 8, maxHp: 80, rarity: 'boss', lootTable: {} as object },
    ];
    for (const e of enemies) {
      await prisma.enemy.create({ data: e });
    }
    created.push('Enemy(4)');
  } else {
    skipped.push('Enemy');
  }

  // 3) Item catalog (3 items)
  const baseKeys = ['baseline-weapon', 'baseline-armor', 'baseline-trinket'];
  const existingItems = await prisma.item.count({ where: { key: { in: baseKeys } } });
  if (existingItems < 3) {
    const items = [
      { key: 'baseline-weapon', name: 'Starter Sword', type: 'weapon', slot: 'weapon', rarity: 'common' },
      { key: 'baseline-armor', name: 'Starter Armor', type: 'armor', slot: 'body', rarity: 'common' },
      { key: 'baseline-trinket', name: 'Starter Amulet', type: 'armor', slot: 'accessories', rarity: 'common' },
    ];
    for (const it of items) {
      await prisma.item.upsert({
        where: { key: it.key },
        update: {},
        create: it,
      });
    }
    created.push('Item(3)');
  } else {
    skipped.push('Item');
  }

  // 4) Flow category hierarchy
  const sssExists = await prisma.sssCategory.findUnique({ where: { id: BASELINE_SSS } });
  if (!sssExists) {
    await prisma.category.upsert({
      where: { id: BASELINE_ROOT },
      update: {},
      create: { id: BASELINE_ROOT, name: 'Baseline' },
    });
    await prisma.subCategory.upsert({
      where: { id: BASELINE_SUB },
      update: {},
      create: { id: BASELINE_SUB, name: 'Flow', categoryId: BASELINE_ROOT },
    });
    await prisma.subSubCategory.upsert({
      where: { id: BASELINE_SUBSUB },
      update: {},
      create: { id: BASELINE_SUBSUB, name: 'Topics', subCategoryId: BASELINE_SUB },
    });
    await prisma.sssCategory.upsert({
      where: { id: BASELINE_SSS },
      update: {},
      create: { id: BASELINE_SSS, name: 'Baseline', subSubCategoryId: BASELINE_SUBSUB, status: 'active' },
    });
    created.push('Category hierarchy');
  } else {
    skipped.push('Category hierarchy');
  }

  // 5) At least one flow question
  const questionExists = await prisma.flowQuestion.findUnique({ where: { id: BASELINE_Q } });
  if (!questionExists) {
    await prisma.flowQuestion.create({
      data: {
        id: BASELINE_Q,
        categoryId: BASELINE_SSS,
        text: 'How are you today?',
        type: QuestionType.SINGLE_CHOICE,
        isActive: true,
      },
    });
    await prisma.flowQuestionOption.createMany({
      data: [
        { id: `${BASELINE_Q}-opt-0`, questionId: BASELINE_Q, label: 'Good', value: 'good', order: 0 },
        { id: `${BASELINE_Q}-opt-1`, questionId: BASELINE_Q, label: 'Okay', value: 'okay', order: 1 },
        { id: `${BASELINE_Q}-opt-2`, questionId: BASELINE_Q, label: 'Not great', value: 'bad', order: 2 },
      ],
    });
    created.push('FlowQuestion(1)');
  } else {
    skipped.push('FlowQuestion');
  }

  return { created, skipped };
}

/** Alpha: Starter Flow - single canonical flow for first-time testers. Idempotent. Loads from content pack. */
export const STARTER_FLOW_SLUG = 'starter';
const STARTER_SSS_ID = 'starter';

function getStarterQuestions(): Array<{ id: string; text: string; type: 'SINGLE_CHOICE' | 'NUMERIC'; opts?: Array<{ label: string; value: string; order: number }>; tags?: string[]; arcStep?: string }> {
  try {
    const packPath = resolvePackPath('starter');
    const questions = loadQuestionsFromPack(packPath);
    return questions.map((q) => ({ id: q.id, text: q.text, type: q.type as 'SINGLE_CHOICE' | 'NUMERIC', opts: q.opts, tags: q.tags, arcStep: q.arcStep }));
  } catch (err) {
    throw new Error(`Starter content pack not found. Run from repo root with content-packs/starter. ${(err as Error).message}`);
  }
}

export async function ensureStarterFlow(prisma: Parameters<typeof ensureBaselineData>[0]): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];

  const subsub = await prisma.subSubCategory.findFirst();
  const subsubId = subsub?.id ?? 'baseline-subsub';
  const starterCat = await prisma.sssCategory.upsert({
    where: { id: STARTER_SSS_ID },
    update: { slug: STARTER_FLOW_SLUG, isStarter: true, visibleInBrowse: false, name: 'Starter', status: 'active' },
    create: {
      id: STARTER_SSS_ID,
      name: 'Starter',
      slug: STARTER_FLOW_SLUG,
      isStarter: true,
      visibleInBrowse: false,
      subSubCategoryId: subsubId,
      status: 'active',
    },
  });
  created.push('SssCategory(starter)');

  const STARTER_QUESTIONS = getStarterQuestions();
  for (const q of STARTER_QUESTIONS) {
    const exist = await prisma.flowQuestion.findUnique({ where: { id: q.id } });
    if (exist) {
      await prisma.flowQuestion.update({
        where: { id: q.id },
        data: { wikiFillCandidate: true },
      });
    } else {
      await prisma.flowQuestion.create({
        data: {
          id: q.id,
          categoryId: starterCat.id,
          text: q.text,
          type: q.type === 'NUMERIC' ? QuestionType.NUMERIC : QuestionType.SINGLE_CHOICE,
          isActive: true,
          wikiFillCandidate: true,
          tags: Array.isArray(q.tags) ? q.tags : [],
          arcStep: (q as { arcStep?: string }).arcStep ?? undefined,
        },
      });
      if ('opts' in q && q.opts) {
        await prisma.flowQuestionOption.createMany({
          data: q.opts.map((o, i) => ({ id: `${q.id}-opt-${i}`, questionId: q.id, label: o.label, value: o.value, order: o.order })),
          skipDuplicates: true,
        });
      }
      created.push(`FlowQuestion(${q.id})`);
    }
  }
  return { created, skipped };
}
