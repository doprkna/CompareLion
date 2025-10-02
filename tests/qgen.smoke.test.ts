import { prisma } from '@parel/db/src/client';
import { processQuestionGenJob } from '@/lib/jobs/questionGen.processor';
import type { Job } from 'bullmq';
import { callAI } from '@/lib/ai';

ejest.mock('@/lib/ai', () => ({
  callAI: jest.fn(),
}));

describe('Question Generation Smoke Test', () => {
  const testLeafId = 'testLeaf';
  const jobId = 'testJob1';

  beforeAll(async () => {
    // clean slate
    await prisma.question.deleteMany({ where: { ssscId: testLeafId } });
    await prisma.questionGeneration.deleteMany({ where: { ssscId: testLeafId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('generates at least 1 question for a leaf', async () => {
    // arrange: stub AI output
    (callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ssscId: testLeafId,
        questions: [{ text: 'Test Question 1' }],
      })
    );

    const fakeJob = {
      id: jobId,
      data: { ssscId: testLeafId, targetCount: 5, overwrite: false },
    } as unknown as Job;

    // act
    const result = await processQuestionGenJob(fakeJob);

    // assert at least one question inserted
    const count = await prisma.question.count({ where: { ssscId: testLeafId } });
    expect(count).toBeGreaterThanOrEqual(1);

    const genLog = await prisma.questionGeneration.findUnique({ where: { id: jobId } });
    expect(genLog).toBeDefined();
    expect(genLog!.status).toBe('success');
    expect(result).toHaveProperty('insertedCount');
  });
});
