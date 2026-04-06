/**
 * seed-demo-big.ts - Big deterministic demo seed for UI/state bug surfacing.
 * Dev-only: exits(1) if APP_ENV !== "dev".
 * Deterministic RNG (mulberry32, seed=1337), stable IDs, idempotent upserts.
 */

import './_loadEnv';
import './guard-seed-demo-env';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { PrismaClient, QuestionType, UserRole } from '@parel/db/client';
import { hash } from 'bcryptjs';

ensureDatabaseUrl();

const prisma = new PrismaClient();

const SEED = 1337;
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CAT_NAMES = [
  'Wellbeing', 'Habits', 'Money', 'Work', 'Relationships',
  'Parenting', 'Health', 'Fun', 'Tech', 'Random',
];

const ROOT_ID = 'seed-big-root';
const SUB_ID = 'seed-big-sub';
const SUBSUB_ID = 'seed-big-subsub';

function ssscId(i: number) { return `seed-big-sssc-${String(i + 1).padStart(2, '0')}`; }
function qId(catIdx: number, qIdx: number) { return `seed-big-q-${String(catIdx + 1).padStart(2, '0')}-${String(qIdx + 1).padStart(3, '0')}`; }
function optId(catIdx: number, qIdx: number, optIdx: number) { return `seed-big-opt-${String(catIdx + 1).padStart(2, '0')}-${String(qIdx + 1).padStart(3, '0')}-${optIdx + 1}`; }

const CHOICE_TEMPLATES: { text: string; opts: string[] }[] = [
  { text: 'How would you rate your energy level today?', opts: ['Low', 'Moderate', 'High', 'Very high'] },
  { text: 'How often do you exercise per week?', opts: ['Never', '1-2 times', '3-4 times', '5+ times'] },
  { text: 'What helps you relax the most?', opts: ['Meditation', 'Exercise', 'Reading', 'Social time'] },
  { text: 'Do you drink enough water daily?', opts: ['Rarely', 'Sometimes', 'Often', 'Always'] },
  { text: 'Which habit do you want to build?', opts: ['Morning routine', 'Exercise', 'Reading', 'Mindfulness'] },
  { text: 'When do you struggle most with habits?', opts: ['Morning', 'Afternoon', 'Evening', 'Weekends'] },
  { text: 'How would you describe your sleep quality?', opts: ['Poor', 'Fair', 'Good', 'Excellent'] },
  { text: 'What is your main source of stress?', opts: ['Work', 'Health', 'Relationships', 'Finances'] },
  { text: 'How often do you save money?', opts: ['Never', 'Rarely', 'Monthly', 'Every paycheck'] },
  { text: 'What is your biggest financial goal?', opts: ['Emergency fund', 'Retirement', 'House', 'Travel'] },
  { text: 'How satisfied are you with your job?', opts: ['Very unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] },
  { text: 'How do you handle conflict at work?', opts: ['Avoid', 'Confront', 'Mediate', 'Escalate'] },
  { text: 'How often do you communicate with family?', opts: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
  { text: 'How would you rate your relationship quality?', opts: ['Poor', 'Fair', 'Good', 'Excellent'] },
  { text: 'How do you spend quality time with kids?', opts: ['Outdoor play', 'Reading', 'Games', 'Screen time'] },
  { text: 'What is your biggest parenting challenge?', opts: ['Discipline', 'Screen time', 'Sleep', 'Eating'] },
  { text: 'How would you rate your overall health?', opts: ['Poor', 'Fair', 'Good', 'Excellent'] },
  { text: 'How often do you eat healthy meals?', opts: ['Rarely', 'Sometimes', 'Often', 'Always'] },
  { text: 'What do you do for fun?', opts: ['Sports', 'Games', 'Arts', 'Socializing'] },
  { text: 'How often do you take breaks?', opts: ['Never', 'Rarely', 'Sometimes', 'Often'] },
  { text: 'How comfortable are you with new tech?', opts: ['Not at all', 'Somewhat', 'Comfortable', 'Expert'] },
  { text: 'How much screen time do you have daily?', opts: ['Under 1h', '1-3h', '3-6h', '6h+'] },
  { text: 'What motivates you most?', opts: ['Achievement', 'Recognition', 'Learning', 'Impact'] },
  { text: 'How do you handle feedback?', opts: ['Embrace', 'Analyze', 'Reflect', 'Act'] },
  { text: 'Pick a random favorite color', opts: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'] },
];

const TEXT_QUESTIONS = [
  'What is one thing you are grateful for today?', 'How would you describe your mood right now?',
  'What is your main wellness goal?', 'What triggers your best habits?', 'What is your biggest money worry?',
  'What would improve your work life?', 'What makes your relationships strong?', 'What do you love about parenting?',
  'What is one health change you want?', 'What brings you joy?',
];

type Stats = Record<string, { created: number; updated: number }>;

async function seedCategories(stats: Stats): Promise<string[]> {
  const root = await prisma.category.upsert({ where: { id: ROOT_ID }, update: {}, create: { id: ROOT_ID, name: 'Demo Categories' } });
  const sub = await prisma.subCategory.upsert({ where: { id: SUB_ID }, update: {}, create: { id: SUB_ID, name: 'Flow', categoryId: root.id } });
  const subsub = await prisma.subSubCategory.upsert({ where: { id: SUBSUB_ID }, update: {}, create: { id: SUBSUB_ID, name: 'Topics', subCategoryId: sub.id } });

  const ids: string[] = [];
  for (let i = 0; i < CAT_NAMES.length; i++) {
    const id = ssscId(i);
    await prisma.sssCategory.upsert({
      where: { id },
      update: { name: CAT_NAMES[i] },
      create: { id, name: CAT_NAMES[i], subSubCategoryId: subsub.id },
    });
    ids.push(id);
  }
  stats['SssCategory'] = { created: CAT_NAMES.length, updated: 0 };
  return ids;
}

interface QRec { id: string; type: string; categoryId: string; text: string; optionIds?: string[]; optionLabels?: string[]; }
async function seedFlowQuestions(catIds: string[], rng: () => number, stats: Stats): Promise<QRec[]> {
  const questions: QRec[] = [];
  let singleCount = 0, textCount = 0, qIdx = 0;

  for (let catIdx = 0; catIdx < catIds.length; catIdx++) {
    const categoryId = catIds[catIdx];
    for (let q = 0; q < 20; q++) {
      const qid = qId(catIdx, qIdx);
      if (singleCount < 140) {
        const tpl = CHOICE_TEMPLATES[qIdx % CHOICE_TEMPLATES.length];
        const nOpts = 4 + Math.floor(rng() * 3);
        const opts = tpl.opts.slice(0, Math.min(nOpts, tpl.opts.length));
        const optionIds: string[] = [];
        for (let o = 0; o < opts.length; o++) {
          optionIds.push(optId(catIdx, qIdx, o));
        }
        questions.push({ id: qid, type: "SINGLE_CHOICE", categoryId, text: tpl.text, optionIds, optionLabels: opts });
        singleCount++;
      } else if (textCount < 10) {
        const text = TEXT_QUESTIONS[textCount % TEXT_QUESTIONS.length];
        questions.push({ id: qid, type: 'TEXT', categoryId, text });
        textCount++;
      } else {
        questions.push({ id: qid, type: rng() < 0.5 ? 'NUMBER' : 'RANGE', categoryId, text: `Rate 1-10: Q${qIdx}` });
      }
      qIdx++;
    }
  }

  for (const q of questions) {
    await prisma.flowQuestion.upsert({
      where: { id: q.id },
      update: { text: q.text, type: q.type as QuestionType, categoryId: q.categoryId, isActive: true },
      create: { id: q.id, text: q.text, type: q.type as QuestionType, categoryId: q.categoryId, isActive: true },
    });
    if (q.optionIds) {
      const tpl = CHOICE_TEMPLATES[questions.indexOf(q) % CHOICE_TEMPLATES.length];
      for (let o = 0; o < q.optionIds.length; o++) {
        const oid = q.optionIds[o];
        const label = tpl.opts[o] ?? `Opt ${o}`;
        await prisma.flowQuestionOption.upsert({
          where: { id: oid },
          update: { questionId: q.id, label, value: label.toLowerCase().replace(/\s+/g, '-'), order: o },
          create: { id: oid, questionId: q.id, label, value: label.toLowerCase().replace(/\s+/g, '-'), order: o },
        });
      }
    }
  }
  stats['FlowQuestion'] = { created: questions.length, updated: 0 };
  return questions;
}

const CANONICAL_DEMO_EMAIL = 'demo@example.com';
const ADMIN_EMAIL = 'admin@example.com';

async function seedUsers(rng: () => number, stats: Stats): Promise<string[]> {
  const pwHash = await hash('password123', 10);
  const adminPwHash = await hash('1AmTheArchitect', 10);
  const ids: string[] = [];

  // Admin user (admin rights)
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPwHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      xp: 0,
      level: 1,
      streakCount: 0,
      questionsAnswered: 0,
      emailVerified: new Date(),
      birthYear: 1990,
    },
    update: { passwordHash: adminPwHash, name: 'Admin User', role: UserRole.ADMIN, birthYear: 1990 },
  });
  ids.push(admin.id);

  // Always ensure canonical demo user exists (docs/UI use demo@example.com)
  const canonical = await prisma.user.upsert({
    where: { email: CANONICAL_DEMO_EMAIL },
    create: {
      email: CANONICAL_DEMO_EMAIL,
      passwordHash: pwHash,
      name: 'Demo Player',
      role: UserRole.USER,
      xp: 0,
      level: 1,
      streakCount: 0,
      questionsAnswered: 0,
      emailVerified: new Date(),
    },
    update: { passwordHash: pwHash, name: 'Demo Player', xp: 0, level: 1, streakCount: 0 },
  });
  ids.push(canonical.id);

  for (let i = 0; i < 50; i++) {
    const email = `demo+${String(i + 1).padStart(3, '0')}@parel.app`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: pwHash, name: `Demo User ${i + 1}`, xp: 0, level: 1, streakCount: 0, questionsAnswered: 0, birthYear: 1990 },
      create: {
        email, passwordHash: pwHash, name: `Demo User ${i + 1}`,
        xp: 0, level: 1, streakCount: 0, questionsAnswered: 0, role: UserRole.USER, birthYear: 1990,
      },
    });
    ids.push(u.id);
  }
  stats['User'] = { created: 52, updated: 0 };
  return ids;
}

async function seedResponses(userIds: string[], questions: QRec[], rng: () => number, stats: Stats): Promise<void> {
  let created = 0;
  for (const uid of userIds) {
    const used = new Set<number>();
    for (let r = 0; r < 10; r++) {
      let idx = Math.floor(rng() * questions.length);
      for (let retry = 0; retry < 50 && used.has(idx); retry++) idx = Math.floor(rng() * questions.length);
      used.add(idx);
      const q = questions[idx];
      if (!q) continue;
      const type = q.type;
      let optionIds: string[] | undefined;
      let textVal: string | undefined;
      let numericVal: number | undefined;
      if (type === 'SINGLE_CHOICE' && q.optionIds?.length) {
        const optIdx = Math.floor(rng() * q.optionIds.length);
        optionIds = [q.optionIds[optIdx]];
      } else if (type === 'TEXT') {
        textVal = 'ok';
      } else {
        numericVal = 1 + Math.floor(rng() * 10);
      }
      try {
        await prisma.userResponse.upsert({
          where: { userId_questionId: { userId: uid, questionId: q.id } },
          update: {},
          create: { userId: uid, questionId: q.id, optionIds: optionIds ?? [], textVal: textVal ?? null, numericVal: numericVal ?? null, skipped: false },
        });
        created++;
      } catch (_) {}
    }
  }
  stats['UserResponse'] = { created, updated: 0 };
}

async function main() {
  const t0 = Date.now();
  const rng = mulberry32(SEED);
  const stats: Stats = {};

  const catIds = await seedCategories(stats);
  const questions = await seedFlowQuestions(catIds, rng, stats);
  const userIds = await seedUsers(rng, stats);
  await seedResponses(userIds, questions, rng, stats);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`seed-demo-big: ${Object.keys(stats).join(', ')} | ${elapsed}s`);
  for (const [model, s] of Object.entries(stats)) {
    console.log(`  ${model}: created=${s.created}, updated=${s.updated}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });







