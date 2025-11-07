import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@parel/db/src/client';
import { 
  getNextQuestionForUser, 
  answerQuestion, 
  skipQuestion, 
  getUserProgressStats 
} from '@/lib/services/flowService';

/**
 * Integration Test: Full Flow Journey
 * Simulates: Login → Fetch Question → Answer → Skip → Complete
 */
describe('Integration: Basic Flow Journey', () => {
  let userId: string;
  let ssscId: string;
  let q1Id: string;
  let q2Id: string;
  let q3Id: string;

  beforeAll(async () => {
    // Setup: Clean existing test data
    await prisma.userQuestion.deleteMany({ 
      where: { userId: { contains: 'integration-flow-' } } 
    });
    await prisma.question.deleteMany({ 
      where: { text: { contains: 'IntegrationQ-' } } 
    });
    await prisma.user.deleteMany({ 
      where: { email: 'integration-flow@test.com' } 
    });

    // Step 1: Simulate user "login" (user creation)
    const user = await prisma.user.create({
      data: {
        email: 'integration-flow@test.com',
        questionsAnswered: 0,
        score: 0,
      }
    });
    userId = user.id;

    // Setup category structure
    const category = await prisma.category.upsert({
      where: { id: 'int-test-category' },
      update: {},
      create: { id: 'int-test-category', name: 'Integration Category', order: 1 }
    });

    const subCategory = await prisma.subCategory.upsert({
      where: { id: 'int-test-subcategory' },
      update: {},
      create: { 
        id: 'int-test-subcategory',
        name: 'Integration SubCategory', 
        categoryId: category.id,
        order: 1
      }
    });

    const subSubCategory = await prisma.subSubCategory.upsert({
      where: { id: 'int-test-subsubcategory' },
      update: {},
      create: { 
        id: 'int-test-subsubcategory',
        name: 'Integration SubSubCategory', 
        subCategoryId: subCategory.id,
        order: 1
      }
    });

    const sssc = await prisma.sssCategory.upsert({
      where: { id: 'int-test-sssc' },
      update: {},
      create: { 
        id: 'int-test-sssc',
        name: 'Integration Leaf', 
        subSubCategoryId: subSubCategory.id
      }
    });
    ssscId = sssc.id;

    // Create questions for the flow
    const q1 = await prisma.question.create({
      data: { text: 'IntegrationQ-1', ssscId, difficulty: 'easy' }
    });
    q1Id = q1.id;

    const q2 = await prisma.question.create({
      data: { text: 'IntegrationQ-2', ssscId, difficulty: 'medium' }
    });
    q2Id = q2.id;

    const q3 = await prisma.question.create({
      data: { text: 'IntegrationQ-3', ssscId, difficulty: 'hard' }
    });
    q3Id = q3.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.userQuestion.deleteMany({ where: { userId } });
    await prisma.question.deleteMany({ where: { id: { in: [q1Id, q2Id, q3Id] } } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should complete full flow: login → fetch → answer → skip → done', async () => {
    // Step 1: User "logged in" (already done in beforeAll)
    expect(userId).toBeDefined();
    
    // Step 2: Fetch first question
    const firstQuestion = await getNextQuestionForUser(ssscId, userId);
    expect(firstQuestion).toBeDefined();
    expect(firstQuestion?.text).toBe('IntegrationQ-1');
    expect(firstQuestion?.id).toBe(q1Id);

    // Verify initial stats
    let stats = await getUserProgressStats(ssscId, userId);
    expect(stats.answered).toBe(0);
    expect(stats.skipped).toBe(0);
    expect(stats.streak).toBe(0);

    // Step 3: Answer first question
    await answerQuestion(userId, q1Id);
    
    // Verify stats after answer
    stats = await getUserProgressStats(ssscId, userId);
    expect(stats.answered).toBe(1);
    expect(stats.skipped).toBe(0);
    expect(stats.streak).toBe(1);

    // Verify user score updated
    let user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.questionsAnswered).toBe(1);
    expect(user?.score).toBe(1); // Easy question = +1

    // Step 4: Fetch next question
    const secondQuestion = await getNextQuestionForUser(ssscId, userId);
    expect(secondQuestion).toBeDefined();
    expect(secondQuestion?.text).toBe('IntegrationQ-2');
    expect(secondQuestion?.id).toBe(q2Id);

    // Step 5: Skip second question
    await skipQuestion(userId, q2Id);
    
    // Verify stats after skip
    stats = await getUserProgressStats(ssscId, userId);
    expect(stats.answered).toBe(1);
    expect(stats.skipped).toBe(1);
    expect(stats.streak).toBe(0); // Streak broken by skip

    // Verify user stats unchanged (skip doesn't add score)
    user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.questionsAnswered).toBe(1);
    expect(user?.score).toBe(1);

    // Step 6: Fetch next question (should be Q3)
    const thirdQuestion = await getNextQuestionForUser(ssscId, userId);
    expect(thirdQuestion).toBeDefined();
    expect(thirdQuestion?.text).toBe('IntegrationQ-3');
    expect(thirdQuestion?.id).toBe(q3Id);

    // Step 7: Answer third question
    await answerQuestion(userId, q3Id);
    
    // Verify final stats
    stats = await getUserProgressStats(ssscId, userId);
    expect(stats.answered).toBe(2);
    expect(stats.skipped).toBe(1);
    expect(stats.streak).toBe(1); // Most recent is answered

    // Verify user score updated
    user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.questionsAnswered).toBe(2);
    expect(user?.score).toBe(4); // Easy(1) + Hard(3)

    // Step 8: Fetch next question (should be undefined - all done)
    const noMoreQuestions = await getNextQuestionForUser(ssscId, userId);
    expect(noMoreQuestions).toBeUndefined();

    // Final verification: All questions accounted for
    const allUserQuestions = await prisma.userQuestion.findMany({
      where: { userId }
    });
    expect(allUserQuestions.length).toBe(3);
    
    const answered = allUserQuestions.filter(q => q.status === 'answered');
    const skipped = allUserQuestions.filter(q => q.status === 'skipped');
    expect(answered.length).toBe(2);
    expect(skipped.length).toBe(1);
  });
});


