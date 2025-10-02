import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@parel/db/src/client';
import { getNextQuestionForUser, answerQuestion, skipQuestion, getUserProgressStats } from '@/lib/services/flowService';

let userId: string;
let ssscId = 'leaf1';
beforeAll(async () => {
  // Clean up
  await prisma.userQuestion.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.user.deleteMany({});
  // Create user
  const user = await prisma.user.create({ data: { email: 'test@example.com' } });
  userId = user.id;
  // Create SssCategory leaf stub
  const leaf = await prisma.sssCategory.create({ data: { name: 'Leaf', subSubCategoryId: '' } });
  ssscId = leaf.id;
  // Create questions
  await prisma.question.createMany({
    data: [
      { text: 'Q1', ssscId: leaf.id },
      { text: 'Q2', ssscId: leaf.id },
    ],
  });
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe('flowService', () => {
  it('should get next unanswered question sequentially', async () => {
    const q = await getNextQuestionForUser(ssscId, userId);
    expect(q?.text).toBe('Q1');
  });

  it('should mark question answered and update streak', async () => {
    await answerQuestion(userId, q!.id);
    const next = await getNextQuestionForUser(ssscId, userId);
    expect(next?.text).toBe('Q2');
    const stats = await getUserProgressStats(ssscId, userId);
    expect(stats.answered).toBe(1);
    expect(stats.streak).toBe(1);
  });

  it('should mark question skipped', async () => {
    await skipQuestion(userId, 'Q2');
    const next = await getNextQuestionForUser(ssscId, userId);
    expect(next).toBeUndefined();
    const stats = await getUserProgressStats(ssscId, userId);
    expect(stats.skipped).toBe(1);
  });
});
