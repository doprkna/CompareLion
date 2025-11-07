import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '@parel/db/src/client';
import { 
  getNextQuestionForUser, 
  answerQuestion, 
  skipQuestion, 
  getUserProgressStats,
  getNextQuestion 
} from '@/lib/services/flowService';

describe('flowService.ts', () => {
  let userId: string;
  let ssscId: string;
  let categoryId: string;
  let questionId1: string;
  let questionId2: string;
  let questionId3: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.userQuestion.deleteMany({ where: { userId: { contains: 'test-flow-' } } });
    await prisma.question.deleteMany({ where: { text: { contains: 'FlowTest-' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'flowtest-' } } });
    
    // Create test user
    const user = await prisma.user.create({ 
      data: { 
        email: 'flowtest-user@example.com',
        questionsAnswered: 0,
        score: 0
      } 
    });
    userId = user.id;

    // Create category hierarchy for testing
    const category = await prisma.category.upsert({
      where: { id: 'test-category-flow' },
      update: {},
      create: { id: 'test-category-flow', name: 'Test Category', order: 1 }
    });
    categoryId = category.id;

    const subCategory = await prisma.subCategory.upsert({
      where: { id: 'test-subcategory-flow' },
      update: {},
      create: { 
        id: 'test-subcategory-flow',
        name: 'Test SubCategory', 
        categoryId: category.id,
        order: 1
      }
    });

    const subSubCategory = await prisma.subSubCategory.upsert({
      where: { id: 'test-subsubcategory-flow' },
      update: {},
      create: { 
        id: 'test-subsubcategory-flow',
        name: 'Test SubSubCategory', 
        subCategoryId: subCategory.id,
        order: 1
      }
    });

    const sssc = await prisma.sssCategory.upsert({
      where: { id: 'test-sssc-flow' },
      update: {},
      create: { 
        id: 'test-sssc-flow',
        name: 'Test Leaf', 
        subSubCategoryId: subSubCategory.id
      }
    });
    ssscId = sssc.id;

    // Create test questions
    const q1 = await prisma.question.create({
      data: { text: 'FlowTest-Q1', ssscId: sssc.id, difficulty: 'easy' },
    });
    questionId1 = q1.id;

    const q2 = await prisma.question.create({
      data: { text: 'FlowTest-Q2', ssscId: sssc.id, difficulty: 'medium' },
    });
    questionId2 = q2.id;

    const q3 = await prisma.question.create({
      data: { text: 'FlowTest-Q3', ssscId: sssc.id, difficulty: 'hard' },
    });
    questionId3 = q3.id;
  });

  beforeEach(async () => {
    // Reset user progress before each test
    await prisma.userQuestion.deleteMany({ where: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { questionsAnswered: 0, score: 0 }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.userQuestion.deleteMany({ where: { userId } });
    await prisma.question.deleteMany({ where: { id: { in: [questionId1, questionId2, questionId3] } } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('getNextQuestionForUser()', () => {
    it('should return first unanswered question', async () => {
      const question = await getNextQuestionForUser(ssscId, userId);
      expect(question).toBeDefined();
      expect(question?.text).toBe('FlowTest-Q1');
    });

    it('should return second question after first is answered', async () => {
      await answerQuestion(userId, questionId1);
      const question = await getNextQuestionForUser(ssscId, userId);
      expect(question).toBeDefined();
      expect(question?.text).toBe('FlowTest-Q2');
    });

    it('should return undefined when all questions are answered', async () => {
      await answerQuestion(userId, questionId1);
      await answerQuestion(userId, questionId2);
      await answerQuestion(userId, questionId3);
      const question = await getNextQuestionForUser(ssscId, userId);
      expect(question).toBeUndefined();
    });

    it('should skip questions marked as skipped and return next unanswered', async () => {
      await skipQuestion(userId, questionId1);
      const question = await getNextQuestionForUser(ssscId, userId);
      // Should still return Q2 (skipped questions are in UserQuestion)
      expect(question).toBeDefined();
      expect(question?.text).toBe('FlowTest-Q2');
    });
  });

  describe('answerQuestion()', () => {
    it('should mark question as answered', async () => {
      await answerQuestion(userId, questionId1);
      
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { userId_questionId: { userId, questionId: questionId1 } }
      });
      
      expect(userQuestion).toBeDefined();
      expect(userQuestion?.status).toBe('answered');
    });

    it('should increment user score based on difficulty', async () => {
      // Q1 is easy (score +1)
      await answerQuestion(userId, questionId1);
      let user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.score).toBe(1);
      expect(user?.questionsAnswered).toBe(1);

      // Q2 is medium (score +2)
      await answerQuestion(userId, questionId2);
      user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.score).toBe(3);
      expect(user?.questionsAnswered).toBe(2);

      // Q3 is hard (score +3)
      await answerQuestion(userId, questionId3);
      user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.score).toBe(6);
      expect(user?.questionsAnswered).toBe(3);
    });

    it('should not double-count if answer called twice', async () => {
      await answerQuestion(userId, questionId1);
      await answerQuestion(userId, questionId1);
      
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user?.questionsAnswered).toBe(1);
      expect(user?.score).toBe(1);
    });

    it('should handle upsert correctly for existing record', async () => {
      // First skip, then answer
      await skipQuestion(userId, questionId1);
      await answerQuestion(userId, questionId1);
      
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { userId_questionId: { userId, questionId: questionId1 } }
      });
      
      expect(userQuestion?.status).toBe('answered');
    });
  });

  describe('skipQuestion()', () => {
    it('should mark question as skipped', async () => {
      await skipQuestion(userId, questionId1);
      
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { userId_questionId: { userId, questionId: questionId1 } }
      });
      
      expect(userQuestion).toBeDefined();
      expect(userQuestion?.status).toBe('skipped');
    });

    it('should create new record if question not yet seen', async () => {
      await skipQuestion(userId, questionId2);
      
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { userId_questionId: { userId, questionId: questionId2 } }
      });
      
      expect(userQuestion).toBeDefined();
      expect(userQuestion?.status).toBe('skipped');
    });

    it('should update status if question was previously answered', async () => {
      await answerQuestion(userId, questionId1);
      await skipQuestion(userId, questionId1);
      
      const userQuestion = await prisma.userQuestion.findUnique({
        where: { userId_questionId: { userId, questionId: questionId1 } }
      });
      
      expect(userQuestion?.status).toBe('skipped');
    });
  });

  describe('getUserProgressStats()', () => {
    it('should return zero stats for new user', async () => {
      const stats = await getUserProgressStats(ssscId, userId);
      expect(stats.answered).toBe(0);
      expect(stats.skipped).toBe(0);
      expect(stats.streak).toBe(0);
    });

    it('should count answered questions correctly', async () => {
      await answerQuestion(userId, questionId1);
      await answerQuestion(userId, questionId2);
      
      const stats = await getUserProgressStats(ssscId, userId);
      expect(stats.answered).toBe(2);
      expect(stats.skipped).toBe(0);
      expect(stats.streak).toBe(2);
    });

    it('should count skipped questions correctly', async () => {
      await skipQuestion(userId, questionId1);
      await skipQuestion(userId, questionId2);
      
      const stats = await getUserProgressStats(ssscId, userId);
      expect(stats.answered).toBe(0);
      expect(stats.skipped).toBe(2);
      expect(stats.streak).toBe(0);
    });

    it('should calculate streak based on most recent answered questions', async () => {
      await answerQuestion(userId, questionId1);
      await answerQuestion(userId, questionId2);
      await skipQuestion(userId, questionId3);
      
      const stats = await getUserProgressStats(ssscId, userId);
      expect(stats.answered).toBe(2);
      expect(stats.skipped).toBe(1);
      // Streak breaks on skip (most recent is skip)
      expect(stats.streak).toBe(0);
    });
  });

  describe('getNextQuestion()', () => {
    it('should return first unanswered question for category', async () => {
      const question = await getNextQuestion(userId, categoryId);
      expect(question).toBeDefined();
      expect(question?.text).toMatch(/^FlowTest-/);
    });

    it('should return undefined when all category questions answered', async () => {
      await answerQuestion(userId, questionId1);
      await answerQuestion(userId, questionId2);
      await answerQuestion(userId, questionId3);
      
      const question = await getNextQuestion(userId, categoryId);
      expect(question).toBeNull();
    });
  });
});


